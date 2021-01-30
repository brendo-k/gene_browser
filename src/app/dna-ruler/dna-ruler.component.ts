import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from "@angular/core"


@Component({
  selector:'app-dna-ruler',
  templateUrl: './dna-ruler.component.html',
  styles: ['canvas{ height: 20px; }'],
})

export class DnaRulerComponent implements OnInit, AfterViewInit {

  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;


  @Input() width: number;
  @Input() dna: string[];
  height: number = 20;

  @ViewChild('canvas') canvas_elem: ElementRef;

  ngOnInit():void{
    
  }

  ngOnChanges(): void{
    if(this.dna){
      this.set_size();
      this.draw();
    }else if(this.cvs){
      this.ctx.clearRect(0,0,this.width, this.height);
    }
  }

  draw(): void{
    console.log('drawing dna-ruler');
    let spacing = this.width/this.dna.length;
    let text_width = this.ctx.measureText('A');
    let left = (spacing-text_width.width)/2
    this.ctx.fillStyle = 'black'
    for(let i = 0; i < this.dna.length; i++){
      this.ctx.fillText(this.dna[i], i*spacing+left, 10);
    }
  }


  set_size(): void {
    let scale = window.devicePixelRatio;
    this.cvs.width = this.width * scale;
    this.ctx.scale(scale, scale);
  }

  ngAfterViewInit(): void {
    this.cvs = this.canvas_elem.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d');

    //adjust resolution
    this.cvs.height = this.height * window.devicePixelRatio;
  }
}
