import { Directive, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Exon } from './exon';

@Directive({
  selector: '[appShowExons]'
})
export class ShowExonsDirective implements OnInit {
  
  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  @Input('appShowExons') show: boolean;
  @Input() genes: Exon;
  @Output() clear: EventEmitter<boolean>;

  constructor(private el: ElementRef) { 
    this.cvs = el.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d');
    this.clear = new EventEmitter<boolean>();
  }

  ngOnInit(): void{
    if(this.show){
      this.draw_aa();
    }else{
      this.clear.emit(true);
    }
  }

  ngOnChanges(): void {
  }
  draw_aa(): void{


  }

}
