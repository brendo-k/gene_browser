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
  prev_x: number;
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
      this.draw_gene();
    }
  }

  draw_gene(): void {
    console.log(this.genes);
    this.ctx.clearRect(0, 0, this.width, this.height);
    let bp_px: number = this.get_conversion();


    //sort genes on starting bp
    this.genes.sort((gene1: Gene, gene2: Gene) => gene1.start - gene2.start);

    let overlap = this.find_overlap();

    //furthest rightmost position seen
    let max_px = 0;

    for (let i = 0; i < this.genes.length; i++){
      //temp height and start of bb
      let top_px = 45;
      let height = 20;
      
      //get start and width of gene in px
      let start_px: number = Math.max((this.genes[i].start - this.coord.start)*bp_px, 0); 
      let gene_start = this.genes[i].start;
      //if start of gene is off browser cordinates use starting borwser cordinates
      if(start_px == 0){
        gene_start = this.coord.start;
      }
      let width_gene = (this.genes[i].end - gene_start) * bp_px;


      if(start_px < max_px){
        top_px += 40;

      }

      if(start_px + width_gene > max_px){
        max_px = start_px + width_gene;
      }

      this.genes[i].bb = {
        left: start_px,
        right: start_px + width_gene,
        top: top_px, 
        bottom: top_px + height, 
      } as Bb 

      this.ctx.fillStyle = "#3399ff";
      this.draw_rounded_rect(start_px, top_px, width_gene, height, 5);
      
      if(this.is_labeled){
        this.ctx.fillStyle = "black";
        this.ctx.fillText(this.genes[i].gene_name, start_px, top_px - 5);
      }
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

  //draws rounded rectangle at x and y positions with width and height.
  //radius is radius of curved edge
  draw_rounded_rect(x:number, y:number, width:number, height:number, radius:number){
    if(width < 10){
      this.ctx.fillRect(x, y, width, height);
    }else{
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
  }

  //clears the canvas
  clear_canvas(): void{
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  find_overlap(): Map<Gene, number>{

    //find out how many other genes each gene overlaps.
    //more overlaps means lower down in the browser.

    //holds key (gene) value (number of overlaps)
    let overlap = new Map<Gene, number>();
    //currently opened genes (haven't reached endpoint yet)
    let arr = new Array<Gene>();

    //loop thorugh all genes
    for (let i = 0; i < this.genes.length; i++){
      
      let cur_gene = this.genes[i];


      //create new array of genes that are still opened
      let new_arr = new Array<Gene>();
      arr.forEach((gene: Gene) => {
        //only add gene if cur gene's start position is before gene's end
        if(gene.end > cur_gene.start){
          new_arr.push(gene);
        }
      });
      //set arr to be new_arr
      arr = new_arr;

      //increment overlap in all genes in new_arr
      new_arr.forEach((gene:Gene) => {
        overlap.set(gene, overlap.get(gene) + 1);
      });

      
      //set current number of overlap for cur_gene
      overlap.set(cur_gene, new_arr.length);
      //add cur_gene to opened
      arr.push(cur_gene);
    }

    return overlap;
  }

}
