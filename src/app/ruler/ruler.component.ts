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

  @Input() 'width': number;
  @Input() 'coord': Coord;

  @ViewChild('canvas') canvas_element: ElementRef;

  constructor() { }

  ngOnInit(): void {
    this.height = 20;
  }

  ngOnChanges(): void{
    if (typeof this.cvs != 'undefined') {
      //console.log(this.coord);
      this.set_size();
      this.draw_scale();
    }
  }

  ngAfterViewInit(): void {
    this.cvs = this.canvas_element.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d');
    this.set_size();

    this.draw_scale();
  }

  set_size(): void {
    let scale = window.devicePixelRatio;
    this.cvs.width = this.width * scale;
    this.cvs.height = this.height * scale;
    this.ctx.scale(scale, scale);
  }

  draw_scale(): void{
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
      let bp = start + bp_change * i;
      this.ctx.beginPath;
      this.ctx.moveTo(offset * i + 1, 15);
      this.ctx.lineTo(offset * i + 1, 5);
      this.ctx.stroke();
      this.ctx.fillText(`${bp}`, offset * i + 2, 13);
    }
  }

}
