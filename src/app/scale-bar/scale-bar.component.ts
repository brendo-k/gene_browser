import { Component, OnInit, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { BrowserStateService } from '../browser-state.service';
import { Coord } from '../coord';
import { AnimationService } from '../animation.service';
import { LoggerService } from '../logger.service';
import {Subscription} from 'rxjs';



@Component({
  selector: 'app-scale-bar',
  templateUrl: './scale-bar.component.html',
  styleUrls: ['./scale-bar.component.css'],
})

export class ScaleBarComponent implements OnInit {
  start: number;
  end: number;

  img_width: number;
  browser_width: number;

  subscription: Subscription;

  width: number;
  left: number;
  scroll_left: number;

  padding_left: number;

  is_left: boolean;
  is_mouse_down: boolean;
  is_inside_rect: boolean;
  is_animate: boolean

  chromosome_top: number;

  @ViewChild('chromosome_img') chromosome_container: ElementRef;
  @ViewChild('selection_box') selection_box: ElementRef;


  @HostListener('window:resize')
  onResize(event) {
    this.update_bounding_box(true);
  }

  @HostListener('document:mousemove', ['$event'])
  onMove(event: MouseEvent){

    if(this.is_mouse_down){
      //if the mouse is moving inside the bounds of the image
      if(this.check_inside(event.x)){

        if (event.x < this.left) {
          this.is_left = true;
        } else if (event.x > this.left && this.width < 10){
          this.is_left = false;
        }

        //if the mouse is moving more left than let most part
        if(this.is_left){
          if (event.x <= this.left) {

            let diff = this.left - event.x;
            this.width += diff;
            this.left = event.x;

            //if mouse is moving right from left side
          } else if(event.x > this.left && event.x < this.left + this.width){
            let diff = event.x - this.left;
            this.width -= diff;
            this.left = event.x;
          }
        }else{
          this.width = event.x - this.left; 
        }
        //if the mouse if moving right or left from right side
      } else if (event.x < this.padding_left) {
        this.left = this.padding_left;
      } else if(this.width == 0){
        this.left = this.padding_left + this.img_width;
      }
    }
  };

  @HostListener('document:mouseup', ['$event'])
  mouseUp(event: MouseEvent){
    if(this.is_mouse_down && this.check_inside(event.x)){
      let img_container = (this.chromosome_container.nativeElement as HTMLElement)
      let rect = img_container.getBoundingClientRect();
      this.padding_left = rect.left;
      let start = this.left - this.padding_left;
      let end = start + this.width;
      let px_to_bp = this.browserState.genome_size/this.img_width;

      let start_bp = Math.floor(start * px_to_bp);
      let end_bp = Math.floor(end * px_to_bp);
      this.logger.debug('select start, end', this, start_bp, end_bp);
      this.logger.debug('left and width', this, this.left, this.width);
      this.browserState.set_coord(start_bp, end_bp, false);
    }
    this.is_mouse_down = false;
  };

  constructor(private browserState: BrowserStateService, 
              private animation: AnimationService,
              private render: Renderer2,
              private logger: LoggerService) { 
    //set starting values
    this.is_mouse_down = false;
    this.is_left = false;
    this.width = 1;

    //get values and subscribe to them
    this.browser_width = this.animation.get_width()
    this.animation.width$.subscribe((width) => {
      this.browser_width = width;
    });
    this.animation.moving$.subscribe((move: number) => {
      let range = this.end - this.start + 1;
      let bp_changed = range/this.browser_width * move;
      let to_move = bp_changed * this.img_width/this.browserState.genome_size;
      this.left -= to_move;
    });
    this.animation.set_moving$.subscribe((move: number) => {
      let img_container = (this.chromosome_container.nativeElement as HTMLElement)
      let rect = img_container.getBoundingClientRect(); this.padding_left = rect.left;

      //get conversion of bp to px
      let range = this.end - this.start;
      let bp_changed = range * move;
      let to_move = bp_changed * (this.img_width/this.browserState.genome_size);

      //new left of scale bar 
      this.scroll_left = this.left + to_move;
      this.scroll_left = Math.round(this.scroll_left);


      if(this.scroll_left != this.left){
        this.animation.is_animate();
        this.logger.debug('animation start', this);

        //start animation
        let el = this.selection_box.nativeElement as HTMLElement;
        el.style.transform = `translateX(${this.scroll_left - this.left}px)`;
        this.render.addClass(el, 'animate');


        //when the transition ends
        el.addEventListener('transitionend', () => {
          this.logger.debug('animation done', this);
          let el = this.selection_box.nativeElement as HTMLElement;

          //return components to normal values
          this.left = this.scroll_left;
          el.style.transform = 'translateX(0px)';
          this.render.removeClass(el, 'animate');

          //let animation service know
          this.animation.is_done();
        }, {once: true});
      }

      //check if subscribed to the animation callback and unsubscribe
      if(this.subscription && !this.subscription.closed){
        this.subscription.unsubscribe();
      }

      //set up callback for when all animations are don 
      this.subscription = this.animation.done$.subscribe((val) => {
        this.logger.debug('animations done, move browser', this);
        this.left = this.scroll_left;
        this.browserState.set_coord(this.start, this.end, false);
        this.subscription.unsubscribe();
      })
    });

  }



  ngOnInit(): void { 
    let coord = this.browserState.get_coord();
    this.start = coord.start;
    this.end = coord.end;
    let chromosome_num = this.browserState.get_chromosome();

    this.browserState.chromosome$.subscribe((chrom: string) => {
      this.set_top(chrom);
    });

    this.browserState.coord$.subscribe((value) => {
      this.start = this.browserState.coord.start;
      this.end = this.browserState.coord.end;
      this.logger.debug('start and end from callback', this, this.start, this.end)
      this.update_bounding_box(); 
    }); 
  }

  set_top(chromosome_num: string): void {
    let num = parseInt(chromosome_num);
    if(num == NaN){
      if(chromosome_num == "X"){
        this.chromosome_top = -23 - 23*27

      }else if(chromosome_num == "Y"){
        this.chromosome_top = -23 - 24*27
      }
    }
    this.chromosome_top = -23 - (num-1)*27; 
  }

  //callback when image loads
  onLoad(): void {
    //prevent dragging of ghost imgages
    let img_container = (this.chromosome_container.nativeElement as HTMLElement)
    let rect = img_container.getBoundingClientRect();

    this.img_width = img_container.offsetWidth;
    this.padding_left = rect.left;
    this.left = rect.left;
    this.scroll_left = this.padding_left;
    this.update_bounding_box();
  }

  update_bounding_box(no_animation:boolean = false): void {

    let img_container = (this.chromosome_container.nativeElement as HTMLElement)
    let rect = img_container.getBoundingClientRect();
    this.padding_left = rect.left;

    this.logger.debug('recieved start and end', this, this.start, this.end);

    let range = this.end - this.start + 1;
    let bp_to_px = this.img_width/this.browserState.genome_size;

    //set width of chromosome selection box
    this.width = range * bp_to_px;
    if(this.width < 1){
      this.width = 1;
    }
    //make the width whole number(easier for pixels);
    this.width = Math.round(this.width);

    //get what new value of left should be for bounding box
    let start_begin = this.start * bp_to_px;
    let diff = start_begin + this.padding_left;
    diff = Math.round(diff);
    if(no_animation){
      this.left = diff;
    }else{

      if(diff - this.left != 0){
        let bb = this.selection_box.nativeElement as HTMLElement
        this.logger.debug('resize animation start', this, diff, this.left);
        this.animation.is_animate();
        this.render.addClass(bb, 'animate');
        bb.style.transform = `translateX(${diff - this.left}px)`

        bb.addEventListener("transitionend", ()=>{
          this.logger.debug('resize animation end', this);
          let bb = this.selection_box.nativeElement as HTMLElement
          let diff = parseInt(bb.style.transform.match(/(-*\d*\.*\d*)px/)[1]);
          this.left = this.left + diff;
          bb.style.transform = 'translateX(0px)';
          this.render.removeClass(bb, 'animate');
          this.animation.is_done();
        }, {once: true});
      }
    }
  }


  mouse_down(event: MouseEvent): void {
    console.log(this.animation.is_animating());
    if(!this.animation.is_animating()){
      this.logger.debug('mouse position scale', this, event.x);
      if(this.check_inside(event.x)){
        this.left = event.x;
        this.width = 1;
        this.is_inside_rect = true;
        this.is_mouse_down = true;
      }else{
        this.is_inside_rect = false;
      }
    }
  }

  check_inside(pos: number): boolean{
    return (pos >= this.padding_left && pos <= this.img_width + this.padding_left)
  }

  move_browser(amount: number){
    this.logger.debug('mouse down', this, amount);
    if(!this.animation.is_animating()){
      //calculate new start and end positions
      let bp_range = this.end - this.start;
      let range = bp_range * amount;
      let new_coord: Coord;
      if(this.start+range < 0){
        new_coord = {start: 1, end: bp_range};
        let start_difference = this.start - new_coord.start;
        amount = -start_difference/bp_range;
      }else if(this.end + range > this.browserState.genome_size){
        new_coord = {start: this.browserState.genome_size - bp_range, end: this.browserState.genome_size};
        let start_difference = new_coord.start - this.start;
        amount = start_difference/bp_range;
      }else{
        new_coord = {start: this.start + range, end: this.end + range};
      }
      this.start = new_coord.start 
      this.end = new_coord.end;

      //start animation
      this.animation.move_set_amount(amount);
    }
  }
  done_animation(is_done: boolean){
    this.animation.is_done();
  }
}
