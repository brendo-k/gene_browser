import { Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { Gene } from '../gene';
import { Coord } from '../coord';
import { Bb } from '../bb';

@Component({
  selector: 'app-gene',
  templateUrl: './gene.component.html',
  styleUrls: ['./gene.component.css']
})
export class GeneComponent implements OnInit {

  cvs: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  height: number;
  mouse_down: boolean;
  prev_x: number;
  selected_gene: Gene;

  @ViewChild('canvas') canvas_element: ElementRef;
  @Input() genes: Gene[]; 
  @Input() width: number; 
  @Input() coord: Coord;

  @HostListener('mousedown', ['$event'])
  onClick(event: MouseEvent){
    this.prev_x = event.x; 
    console.log(`gene: mouse down: ${this.prev_x}`);
    this.mouse_down = true;
  }

  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent){

    if(this.mouse_down){
      //lets the users scroll on the browser
      let diff: number = this.prev_x - event.x;
      let bp_px: number = this.get_conversion();
    }

    let x = event.offsetX;
    let y = event.offsetY;

    let seen = false;
    this.genes.forEach((gene: Gene) => {
      if (x >= gene.bb.left 
          && x <= gene.bb.right 
          && y >= gene.bb.top 
          && y <= gene.bb.bottom){
        
            this.selected_gene = gene;
            seen = true;
            

      }
    }) 

    if(!seen){
      this.selected_gene = null;
    }
  }


  constructor() { 
    this.mouse_down = false;
    this.height = 200;
    this.genes = [];
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.cvs = this.canvas_element.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d')
    this.set_size();
    this.draw_gene();
  }
  
  ngOnChanges(): void {
    if(typeof this.canvas_element != 'undefined'){
      this.draw_gene();
    }
  }

  draw_gene(): void {
    console.log(this.genes);
    this.ctx.clearRect(0, 0, this.width, this.height);
    let bp_px: number = this.get_conversion();

    let top_px = 45;
    let height = 20;

    this.genes.sort((gene1: Gene, gene2: Gene) => gene1.start - gene2.start);
    

    for (let i = 0; i < this.genes.length; i++){

      let start_px: number = Math.max((this.genes[i].start - this.coord.start)*bp_px, 0); 
      let width_gene = (this.genes[i].end - this.genes[i].start) * bp_px;

      this.genes[i].bb = {
        left: start_px,
        right: start_px + width_gene,
        top: top_px, 
        bottom: top_px + height, 
      } as Bb 

      this.ctx.fillStyle = "#3399ff";
      this.ctx.fillRect(start_px, top_px, width_gene, height);
      this.ctx.fillStyle = "black";
      this.ctx.fillText(this.genes[i].gene_name, start_px, top_px - 2);
    }

  }

  set_size(): void {
    let scale = window.devicePixelRatio;
    this.cvs.width = this.width * scale;
    this.cvs.height = this.height * scale;
    this.ctx.scale(scale, scale);
  }

  get_conversion(): number {
    let range = this.coord.end - this.coord.start;
    let bp_px: number = this.width/range;
    return bp_px;
  }

}
