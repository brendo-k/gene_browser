import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from "@angular/core"
import { AnimationService } from '../animation.service';
import { LoggerService } from '../logger.service';


@Component({
  selector:'app-dna-ruler',
  templateUrl: './dna-ruler.component.html',
  styles: ['canvas{ height: 20px; }'],
})

export class DnaRulerComponent implements OnInit, AfterViewInit {

  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  left: number;
  total_width: number;
  scroll_amount: number;

  private _width;
  @Input() 
  set width(width: number){
    this.logger.debug('setting width', this, width);
    this._width = width;
    this.set_size();
    if(this.cvs){
      let scale = window.devicePixelRatio;
      this.cvs.width = this.total_width * scale;
      this.ctx.scale(scale, scale);
    }
  }
  @Input() dna: string[];
  height: number = 20;

  @ViewChild('canvas') canvas_elem: ElementRef;

  ngOnInit():void{
    this.animate.moving$.subscribe((move: number) => {
      this.move(move);
    });
    this.animate.set_moving$.subscribe((move: number) => {
      move = this._width * move
      this.scroll_amount = this.left - move;
    });
    this.set_size();
    this.logger.debug('init', this, this._width);
  }

  constructor(private animate: AnimationService, private logger: LoggerService){
  }

  move(amount: number): void {
    this.left += amount;
  }

  ngOnChanges(): void{
    if(this.cvs){
      this.ctx.clearRect(0,0,this.total_width,this.height);
      this.draw();
    }
  }

  draw(): void{
    let spacing = this.total_width/this.dna.length;
    let text_width = this.ctx.measureText('A');
    let left = spacing-text_width.width/2
    this.ctx.fillStyle = 'black'
    for(let i = 0; i < this.dna.length; i++){
      this.ctx.fillText(this.dna[i], i*spacing+left, 10);
    }
  }


  set_size(): void {
    this.left = -this._width;
    this.scroll_amount = this.left;
    this.total_width = this._width * 3;
  }

  ngAfterViewInit(): void {
    this.cvs = this.canvas_elem.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d');
    this.cvs.height = this.height * window.devicePixelRatio;
    let scale = window.devicePixelRatio;
    this.cvs.width = this.total_width * scale;
    this.ctx.scale(scale, scale);
    this.set_size();
    this.draw();
    this.logger.debug("initalize canvas", this);
  }

  animation_done(done: boolean) {
    this.left = this.scroll_amount;
    this.scroll_amount = -this._width;
  }
}
