import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef,
  Renderer2 } from "@angular/core"
import { AnimationService } from '../animation.service';
import { LoggerService } from '../logger.service';
import { Subscription } from 'rxjs';


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
  subscription: Subscription

  _width: number;
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
  get width(){
    return this._width;
  }

  @Input() dna: string[];
  height: number = 20;

  @ViewChild('canvas') canvas_elem: ElementRef;

  ngOnDestroy(){
    console.log('remove observable');
    this.subscription.unsubscribe();
  }

  ngOnInit():void{
    this.animate.moving$.subscribe((move: number) => {
      this.move(move);
    });

    this.set_size();
    this.logger.debug('init', this, this._width);
    this.set_observable();
  }

  constructor(private animate: AnimationService, private logger: LoggerService, private render: Renderer2){}

  set_observable(){
    this.subscription = this.animate.set_moving$.subscribe((move: number) => {
      this.logger.debug('animation start', this);
      move = this._width * move
      this.scroll_amount = this.left - move;

      let el = this.canvas_elem.nativeElement as HTMLElement;
      this.render.addClass(el, 'animate');
      el.style.transform = `translateX(${this.scroll_amount - this.left}px)`;

      this.animate.is_animate();

      let listener = el.addEventListener('transitionend', () => {

        this.logger.debug('animation end', this);
        let el = this.canvas_elem.nativeElement as HTMLElement;
        el.style.transform = 'translateX(0px)';
        this.render.removeClass(el, 'animate');
        this.left = this.scroll_amount;

        this.animate.is_done();
      }, {once: true});

    });
  }

  move(amount: number): void {
    this.left += amount;
  }

  ngOnChanges(): void{
    if(this.cvs){
      this.left = -this.width;
      this.scroll_amount = null;
      this.ctx.clearRect(0,0,this.total_width,this.height);
      this.draw();
    }
  }

  draw(): void{
    let spacing = this.total_width/(this.dna.length);
    this.ctx.fillStyle = 'black'
    for(let i = 0; i < this.dna.length; i++){
      let text_width = this.ctx.measureText(this.dna[i]);
      this.ctx.fillText(this.dna[i], Math.round(i*spacing-text_width.width/2), 10);
    }
  }


  set_size(): void {
    this.left = -this._width;
    this.scroll_amount = this.left;
    this.total_width = this._width * 3;
    this.logger.debug("setting size: left, scroll, total_width", this, this.left, this.scroll_amount, this.total_width);
  }

  ngAfterViewInit(): void {
    this.cvs = this.canvas_elem.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d');
    this.cvs.height = this.height * window.devicePixelRatio;
    let scale = window.devicePixelRatio;
    this.cvs.width = this.total_width * scale;
    this.logger.debug('setting total width', this, this.total_width);

    this.ctx.scale(scale, scale);
    this.draw();
    this.logger.debug("initalize canvas", this);
  }

}
