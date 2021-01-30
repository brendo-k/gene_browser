import { Component, OnInit, ElementRef, ViewChild, Input, HostListener} from '@angular/core';
import { Coord } from '../coord';

@Component({
  selector: 'app-ruler',
  templateUrl: './ruler.component.html',
  styleUrls: ['./ruler.component.css']
})

export class RulerComponent implements OnInit {
  ctx: CanvasRenderingContext2D;
  cvs: HTMLCanvasElement;
  height: number;

  is_down: boolean;
  mouse_pos: number;
  start: number;
  left: number;
  
  @HostListener('mousedown', ['$event'])
  onDown(event: MouseEvent){
    this.is_down = true;
    this.start = event.x;
  }
  
  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent){
    if(this.is_down){
      //console.log('mouse_move');
    }
  }

  @Input() 'width': number;
  @Input() 'coord': Coord;

  @ViewChild('canvas') canvas_element: ElementRef;

  constructor() { }

  ngOnInit(): void {
    this.height = 20;
    this.is_down = false;
  }

  ngOnChanges(): void{
    if (typeof this.cvs != 'undefined') {
      let rect = this.cvs.getBoundingClientRect();
      console.log(rect);
      this.set_size();
      this.draw_scale();
    }
  }

  ngAfterViewInit(): void {
    this.cvs = this.canvas_element.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d');
    this.set_size();
    let rect = this.cvs.getBoundingClientRect();
    console.log(rect);
  }

  set_size(): void {
    let scale = window.devicePixelRatio;
    this.cvs.width = this.width * scale;
    this.cvs.height = this.height * scale;
    this.ctx.scale(scale, scale);
  }

  draw_scale(): void{
    console.log('draw_scale');
    let width = this.width;
    let height = this.height;

    this.ctx.strokeStyle = "#000";
    this.ctx.fillStyle = "#000";
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 15);
    this.ctx.lineTo(width, 15);
    this.ctx.stroke();

    let ticks = 10
    let offset = width/ticks;
    
    let start = this.coord.start;
    let end = this.coord.end;
    let range = end - start + 1;
    let bp_change = Math.floor(range/ticks);

    for (let i = 0; i < ticks; i++){
      let pos = Math.floor(offset * i)
      let bp = start + bp_change * i;
      this.ctx.beginPath;
      this.ctx.moveTo(pos + 1, 15);
      this.ctx.lineTo(pos + 1, 5);
      this.ctx.stroke();
      this.ctx.fillText(`${bp}`, offset * i + 2, 13);
    }
  }

}
