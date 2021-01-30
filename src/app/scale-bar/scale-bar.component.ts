import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BrowserStateService } from '../browser-state.service';
import { Coord } from '../coord';


@Component({
  selector: 'app-scale-bar',
  templateUrl: './scale-bar.component.html',
  styleUrls: ['./scale-bar.component.css']
})

export class ScaleBarComponent implements OnInit {
  start: number;
  end: number;
  img_width: number;
  width: number;
  padding_left: number;
  left: number;
  is_left: boolean;
  is_mouse_down: boolean;
  chromosome_num: string;
  
  chromosome_top: number;

  @ViewChild('chromosome_img') chromosome_container: ElementRef;

  @HostListener('window:resize')
  onResize(event) {
      this.update_bounding_box();
  }

  @HostListener('document:mousemove', ['$event'])
  onMove(event: MouseEvent){
      if(this.is_mouse_down){
          //console.log('mouse_move');

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
    if(this.is_mouse_down && this.check_inside(this.left)){


      let start = this.left - this.padding_left;
      let end = start + this.width + 1;
      let px_to_bp = this.browserState.genome_size/this.img_width;

      let start_bp = Math.floor(start * px_to_bp);
      let end_bp = Math.floor(end * px_to_bp);
      console.log(start_bp, end_bp);
      this.browserState.set_coord(start_bp, end_bp, false);
    }
    this.is_mouse_down = false;
  };

  constructor(private browserState: BrowserStateService) { 
    //set starting values
    this.is_mouse_down = false;
    this.is_left = false;
    this.width = 0;

    //create listeners
  }


  ngOnInit(): void {

    let coord = this.browserState.get_coord();
    this.start = coord.start;
    this.end = coord.end;
    this.chromosome_num = this.browserState.get_chromosome();
    this.set_top();

    this.browserState.chromosome$.subscribe((chrom: string) => {
      this.chromosome_num = chrom;
      this.set_top();
    });
    this.browserState.coord$.subscribe((value) =>{
      this.start = this.browserState.coord.start;
      this.end = this.browserState.coord.end;
      this.update_bounding_box();
    });
  }

  set_top(): void {
    try{
      let num = parseInt(this.chromosome_num);
      this.chromosome_top = -23 - (num-1)*27; 
    }catch{
      if(this.chromosome_num == "X"){
        this.chromosome_top = -23 - 23*27

      }else if(this.chromosome_num == "Y"){
        this.chromosome_top = -23 - 24*27

      }
    }

  }

  //callback when image loads
  onLoad(): void {
    //prevent dragging of ghost imgages
    let img_container = (this.chromosome_container.nativeElement as HTMLElement)
    let rect = img_container.getBoundingClientRect();

    this.img_width = img_container.offsetWidth;
    console.log(this.img_width);
    this.update_bounding_box();
    this.padding_left = rect.left;
  }

  update_bounding_box(): void {
    //console.log(`updating bounding box`);
    let img_container = (this.chromosome_container.nativeElement as HTMLElement)
    let rect = img_container.getBoundingClientRect();

    this.padding_left = rect.left;
    let range = this.end - this.start + 1;
    let bp_to_px = this.img_width/this.browserState.genome_size;
    this.width = range * bp_to_px;
    if(this.width < 1){
      this.width = 1;
    }

    let start_begin = this.start * bp_to_px;
    this.left = start_begin + this.padding_left;
    
  }

  mouse_down(event: MouseEvent): void {
      //console.log("mouse click");
      this.left = event.x;
      this.width = 0;
      this.is_mouse_down = true;
  }

  check_inside(pos: number): boolean{
    return (pos >= this.padding_left && pos <= this.img_width + this.padding_left)
  }

  move_browser(amount: number){
    let bp_range = this.end - this.start + 1;
    let range = bp_range * amount;
    if(this.start+range < 0){
      this.browserState.set_coord(1, bp_range, false);
    }else if(this.start + range > this.browserState.genome_size){
      this.browserState.set_coord(this.browserState.genome_size - bp_range, this.browserState.genome_size, false);
    }else{
      this.browserState.set_coord(this.start + range, this.end + range, false);
    }
  }
}
