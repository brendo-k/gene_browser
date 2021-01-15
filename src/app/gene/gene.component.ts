import { Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
import { Gene } from '../gene';
import { Coord } from '../coord';
import { Bb } from '../bb';
import { BrowserStateService } from '../browser-state.service';
import { GenomeService } from '../genome.service';
import { Mrna } from '../mrna';

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
  selected_gene: Gene;

  @ViewChild('canvas') canvas_element: ElementRef;
  @Input() genes: Gene[]; 
  @Input() width: number; 
  @Input() is_labeled: Boolean;
  @Input() coord: Coord;

  @HostListener('mousedown', ['$event'])
  onClick(event: MouseEvent){
    if(this.selected_gene != null){
      this.browser_state.set_coord(this.selected_gene.start, this.selected_gene.end, false); 
      
      this.genome_service.get_mRNA(this.selected_gene._id).subscribe((mRNA: Mrna) =>{
        console.log(mRNA);
      });
    }
    this.mouse_down = true;
  }

  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent){

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


  constructor(private browser_state: BrowserStateService,
              private genome_service: GenomeService) { 
    this.mouse_down = false;
  }

  ngOnInit(): void {
    this.genes = [];
    this.height = 200;
    this.genes = [];
  }

  ngAfterViewInit(): void {
    this.cvs = this.canvas_element.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d')
    this.set_size();
    this.draw_gene();
  }
  
  ngOnChanges(): void {
    if(typeof this.canvas_element != 'undefined'){
      this.clear_canvas();
      this.set_size();
      this.draw_gene();
    }
  }

  draw_gene(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);

    //sort genes on starting bp
    //TODO: sort genes on db
    this.genes.sort((gene1: Gene, gene2: Gene) => gene1.start - gene2.start);


    //find drawing positions for all genes to be shown
    let new_height = this.get_positions();
    //set the new height of the canvas
    this.set_height(new_height); 
    //draw the genes
    this.draw();

  }

  get_positions(): number{
    //furthest rightmost position seen
    let bp_px: number = this.get_conversion();
    let pos = new Array<number>();
    pos.push(-1);
    for (let i = 0; i < this.genes.length; i++){
      let cur_gene = this.genes[i]
      //temp height and start of bb
      let top_px = 45;
      let height = 20;
      
      //get start and width of gene in px
      let start_px: number = Math.max((cur_gene.start - this.coord.start)*bp_px, 0); 
      let gene_start = cur_gene.start;
      //if start of gene is off browser cordinates use starting borwser cordinates
      if(start_px == 0){
        gene_start = this.coord.start;
      }

      let width_gene = (cur_gene.end - gene_start) * bp_px;

      let pos_counter = -1;
      for (let i = 0; i < pos.length; i++){
        if(start_px > pos[i] + 5){
          pos_counter = i;
          break;
        }
      }

      let furthest;
      if(this.is_labeled){
        furthest = start_px + Math.max(this.ctx.measureText(cur_gene.gene_name).width, width_gene);
      }else{
        furthest = start_px + width_gene;
      }

      if (pos_counter == -1){
        pos.push(furthest);
        pos_counter = pos.length - 1;
      }else{
        pos[pos_counter] = furthest;
      }


      top_px += top_px * pos_counter;


      cur_gene.bb = {
        left: start_px,
        right: start_px + width_gene,
        top: top_px, 
        bottom: top_px + height, 
      } as Bb 
    }
    return Math.max((pos.length) * 45, 200);
  }

  draw(): void{
    this.genes.forEach((gene: Gene) =>{
      let {left, right, top, bottom} = gene.bb;
      this.ctx.fillStyle = "#3399ff";
      this.draw_rounded_rect(left, top, right-left, bottom-top, 5);
      
      if(this.is_labeled){
        this.ctx.fillStyle = "black";
        this.ctx.fillText(gene.gene_name, left, top - 5);
      }
    });
  }

  set_height(height: number): void {

    this.height = height;
    let scale = window.devicePixelRatio;
    this.cvs.height = this.height * scale;
    this.ctx.scale(scale, scale);
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

  //draws rounded rectangle at x and y positions with width and height.
  //radius is radius of curved edge
  draw_rounded_rect(x:number, y:number, width:number, height:number, radius:number){
    if(width < 20){
      radius = width/4;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  //clears the canvas
  clear_canvas(): void{
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  //find_overlap(): Map<Gene, number>{

  //  //find out how many other genes each gene overlaps.
  //  //more overlaps means lower down in the browser.

  //  //holds key (gene) value (number of overlaps)
  //  let overlap = new Map<Gene, number>();
  //  //currently opened genes (haven't reached endpoint yet)
  //  let arr = new Array<Gene>();

  //  //loop thorugh all genes
  //  for (let i = 0; i < this.genes.length; i++){
  //    
  //    let cur_gene = this.genes[i];
  //    //create new array of genes that are still opened
  //    let new_arr = new Array<Gene>();
  //    arr.forEach((gene: Gene) => {
  //      //only add gene if cur gene's start position is before gene's end
  //      if(gene.end > cur_gene.start){
  //        new_arr.push(gene);
  //      }
  //    });
  //    //set arr to be new_arr
  //    arr = new_arr;

  //    //increment overlap in all genes in new_arr
  //    new_arr.forEach((gene:Gene) => {
  //      overlap.set(gene, overlap.get(gene) + 1);
  //    });

  //    
  //    //set current number of overlap for cur_gene
  //    overlap.set(cur_gene, new_arr.length);
  //    //add cur_gene to opened
  //    arr.push(cur_gene);
  //  }

  //  return overlap;
  //}

}
