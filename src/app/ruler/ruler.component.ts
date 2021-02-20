import { Component, OnInit, ElementRef, ViewChild, Input, HostListener, 
  EventEmitter, Output, Renderer2} from '@angular/core';
import { AnimationService } from '../animation.service';
import { Coord } from '../coord';
import { LoggerService } from '../logger.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-ruler',
  templateUrl: './ruler.component.html',
  styleUrls: ['./ruler.component.css'],
})

export class RulerComponent implements OnInit {
  ctx: CanvasRenderingContext2D;
  cvs: HTMLCanvasElement;
  total_width: number;
  height: number = 20;

  select_left: number;
  select_right: number;
  is_left: boolean;

  is_down: boolean;
  mouse_pos: number;
  start: number;
  left: number;
  scroll_amount: number;

  private _width: number;
  @Input() 
  set width(width: number){
    this.logger.debug('detect width change', this, width);
    this._width = width
    this.set_total_size();
    if(this.cvs){
      this.set_canvas_size();
    }
  }
  get width(){
    return this._width;
  }

  @Input() coord: Coord;
  @Output() height_emit: EventEmitter<number>;
  
  @ViewChild('canvas') canvas_element: ElementRef;

  @HostListener('mousedown', ['$event'])
  onDown(event: MouseEvent){
    this.is_down = true;
    let rel_pos = event.offsetX - this._width
    this.select_left = rel_pos;
    this.select_right = this._width - rel_pos;
    this.is_left = true;
  }
  
  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent){
    let rel_pos = event.offsetX - this._width
    if(this.is_down){
      if(this.is_left){
        this.select_left = rel_pos;
        if(this.select_left > this._width - this.select_right){
          this.select_left = this._width - this.select_right
          this.is_left = false;
        }
      }else{
        this.select_right = this._width - rel_pos;
        if(this.select_left > this._width - this.select_right){
          this.select_right = this._width - this.select_left
          this.is_left = true;
        }
      }
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onUp(event: MouseEvent){
    this.is_down = false;
    this.select_left = 0;
    this.select_right = this._width;
  }

  constructor(private animation: AnimationService, 
              private logger: LoggerService,
              private render: Renderer2) { }

  ngOnInit(): void {
    this.is_down = false;
    this.set_total_size();
    this.animation.moving$.subscribe((move: number) => {
      this.animate_move(move);
    });

    this.animation.set_moving$.subscribe((move: number) => {
      let move_px = this._width * move;
      this.scroll_amount = this.left - move_px;
      let el = this.canvas_element.nativeElement as HTMLElement;
      this.render.addClass(el, 'animate');
      el.style.transform = `translateX(${this.scroll_amount - this.left}px)`;
      this.logger.debug('animation start', this, `translateX(${this.scroll_amount - this.left})`);

      el.addEventListener('transitionend',() => {
        this.logger.debug('animation done', this);
        let el = this.canvas_element.nativeElement as HTMLElement;
        el.style.transform = 'translateX(0px)';
        this.render.removeClass(el, 'animate');
        this.left = this.scroll_amount;
        this.animation.is_done();
      }, {once: true});
      this.animation.is_animate();
    });
  }

  ngOnChanges(): void{
    if (typeof this.cvs != 'undefined') {
      //set animation defaults
      this.left = -this.width;
      this.scroll_amount = null;
      this.select_left = 0;
      this.select_right = this._width;
      this.draw_scale();
    }
  }

  animate_move(move: number) {
    this.left += move;
  }

  ngAfterViewInit(): void {
    this.cvs = this.canvas_element.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d');
    this.set_canvas_size();
    //let rect = this.cvs.getBoundingClientRect();
  }

  set_total_size(): void{
    this.total_width = this._width * 3;
    this.left = -this._width;
    this.scroll_amount = null;
    this.logger.debug('setting width, left, scroll', this, this.total_width, this.left, this.scroll_amount);
  }

  set_canvas_size(): void {
    let scale = window.devicePixelRatio;
    this.cvs.width = this.total_width * scale;
    this.cvs.height = this.height * scale;
    this.ctx.scale(scale, scale);
  }

  draw_scale(): void{
    let width = this.total_width;
    let height = this.height;
    let total_range = this.coord.end - this.coord.start + 1;
  
    //get the amount for each break in the ruler
    let split_amount = RulerComponent.get_split_length(total_range); 
    let append_map = new Map<number, string>();

    //get the unit prefix for bp
    let append = ""
    if(split_amount < 1000){
    }else if(split_amount < 1000000){
      append = "K"
    }else if(split_amount < 1000000000){
      append = "M"
    }else{
      append = "G"
    }

    //set fillstyle
    this.ctx.strokeStyle = "#000";
    this.ctx.fillStyle = "#000";

    //create the starting bottom line for ruler
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 15);
    this.ctx.lineTo(width, 15);
    this.ctx.stroke();

    //get the range of the browser width
    let range = this.coord.end - this.coord.start;

    let px_to_bp = range/this._width;
    let bp_to_px = this._width/range;

    let first_bp = this.coord.start - range;
    let last_bp = (this.coord.end + range + 1);
    this.logger.debug('first and last bp', this, first_bp, last_bp, last_bp-first_bp);
    //find first tick to be draw
    //ticks are drawn at every multiple of split amount
    let tick_bp = Math.ceil(first_bp/split_amount)*split_amount;
    while (tick_bp < last_bp){

      //get the position of the tick
      let tick_px = Math.floor((tick_bp - first_bp) * bp_to_px);
      let display_bp = tick_bp;
      let display = display_bp.toString();
      this.ctx.moveTo(tick_px, 15);
      this.ctx.lineTo(tick_px, 5);
      if(append != ""){
        display_bp /= split_amount;
        display = display_bp.toString() + append;
      }
      this.ctx.fillText(display, tick_px + 1, 13);
      let text_width = this.ctx.measureText(display).width;
      this.ctx.stroke();

      for(let i = 1; i < 10; i++){
        let small_tick = Math.ceil(tick_px + (split_amount*i)/10 * bp_to_px);
        if(i == 5){
          this.ctx.moveTo(small_tick, 15);
          this.ctx.lineTo(small_tick, 7);
        }else{
          if(small_tick > text_width + tick_px){
            this.ctx.moveTo(small_tick, 15);
            this.ctx.lineTo(small_tick, 11);
          }
        }
      }
      tick_bp += split_amount;
    }
  }

  static get_split_length(num: number): number{
    let digit = 1
    while(num > 0){
      num = Math.floor(num/10);
      if(num < 2){
        break;
      }
      digit += 1
    }

    return Math.max(Math.pow(10, digit-1), 10);
  }
}

