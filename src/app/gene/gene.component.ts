import { Component, OnInit, ViewChild, ElementRef, Input} from '@angular/core';
import { Output, HostListener, EventEmitter} from '@angular/core';
import { Gene } from '../gene';
import { Coord } from '../coord';
import { Bb } from '../bb';
import { Strand } from '../strand.enum';
import { BrowserStateService } from '../browser-state.service';
import { GenomeService } from '../genome.service';
import { Mrna } from '../mrna';
import { Exon } from '../exon';
import { DNA } from '../dna';

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
  is_moving: boolean;

  gene_spacing = 45;
  gene_height = 20;


  @ViewChild('canvas') canvas_element: ElementRef;

  @Input() genes: Gene[]; 
  @Input() width: number; 
  @Input() is_labeled: Boolean;
  @Input() coord: Coord;
  @Input() container_height: number;

  @Output() show_exons = new EventEmitter<Gene>();
  @Output() new_coords = new EventEmitter<Coord>();

  @HostListener('mouseup', ['$event'])
  onClick(event: MouseEvent){
    
    if(this.selected_gene != null && !this.is_moving){
      this.show_exons.emit(this.selected_gene); 
      let new_coord = {
        start: this.selected_gene.start, 
        end: this.selected_gene.end,
      } as Coord
      this.new_coords.emit(new_coord)
    }
    this.mouse_down = true;
  }

  @HostListener('mousedown', ['$event'])
  onDown(event: MouseEvent){
    this.is_moving = false;
  }

  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent){

    this.is_moving = true;
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
    }); 
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
    this.height = 460;
    this.cvs = null 
    this.ctx = null 
  }

  ngAfterViewInit(): void {
    this.cvs = this.canvas_element.nativeElement as HTMLCanvasElement;
    this.ctx = this.cvs.getContext('2d')
    this.draw_browser(true)
  }
  
  ngOnChanges(): void {
    if(typeof this.canvas_element != 'undefined'){
      this.draw_browser();
    }
  }

  draw_browser(init: boolean = false): void{
    this.set_size();
    if(!init){
      this.clear_canvas();
    }
    this.draw_gene();
  }

  draw_gene(): void {
    //sort genes on starting bp
    //TODO: sort genes on db
    this.genes.sort((gene1: Gene, gene2: Gene) => gene1.start - gene2.start);

    //find drawing positions for all genes to be shown
    let new_height = this.get_positions();
    //set the new height of the canvas
    this.set_height(new_height); 
    //draw the genes
    this.draw_all();

  }

  get_positions(): number{
    //furthest rightmost position seen
    if (this.genes.length != 0 && this.genes[0].mRNA == null){
      return this.get_gene_position();
    }else{
      return this.get_exon_positions();
    }
  }

  draw_all(): void{

    if (this.genes.length != 0 && this.genes[0].mRNA == null){
      this.genes.forEach((gene: Gene) =>{
        let {left, right, top, bottom} = gene.bb;
        this.ctx.fillStyle = "#3399ff";
        this.draw_rounded_rect(left, top, right-left, bottom-top, 5);

        if(this.is_labeled){
          this.ctx.fillStyle = "black";
          this.ctx.fillText(gene.gene_name, left, top - 5);
        }
      });
    }else{
      this.draw_exons();
    }
  }

  set_height(height: number): void {
    height = Math.max(460, height);
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
    width = Math.max(width, 1);

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

  get_gene_position(): number{
    let pos = new Array<number>();
    pos.push(-1);
    for (let i = 0; i < this.genes.length; i++){
      let cur_gene = this.genes[i]
      //temp height and start of bb
      let top_px = this.gene_spacing;
      let height = this.gene_height;
      
      //get start and width of gene in px
      let start_px = this.get_gene_start_px(cur_gene); 
      let width_gene = this.get_gene_width(cur_gene); 
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

      //final top position
      top_px += top_px * pos_counter;

      //save bounding box of gene
      cur_gene.bb = {
        left: start_px,
        right: start_px + width_gene, 
        top: top_px, 
        bottom: top_px + height, 
      } as Bb 
    }

    //return the height of the canvas
    return Math.max((pos.length + 1) * 45, 200);
  }

  get_exon_positions(): number {
    //genes that haven't reached their end yet
    let opened = new Array<Gene>();
    //vertical spaces that the gene takes(indecies)
    let gene_range_v = new Map<Gene, number[]>();
    //spacing variables
    let gene_spacing = this.gene_spacing;
    let gene_height = this.gene_height;
    this.genes.forEach((gene: Gene) =>{
      let transcripts = gene.mRNA.length;
      let height = transcripts * gene_height 
      opened = opened.filter((open: Gene) => {
        return open.end > gene.start
      });
      let covered = [];
      opened.forEach((open: Gene) => {
        covered.push(gene_range_v.get(open))
      });

      covered.sort((a, b) => {
        return a[0]-b[0]
      });
      if(covered.length == 0){
        gene_range_v.set(gene, [1, transcripts]);
      }else if(transcripts < covered[0][0]){
        gene_range_v.set(gene, [0, transcripts]);
      }else{
        let set = false;
        for(let i = 0; i < covered.length-1; i++){
          if(covered[i][1] + transcripts + 1 < covered[i+1][0]){
            gene_range_v.set(gene, [covered[i][1] + 1, covered[i][1] + transcripts]);
            set = true;
            break;
          }
        }
        if(!set){
          let end = covered.length - 1;
          gene_range_v.set(gene, [covered[end][1] + 1, covered[end][1]+ transcripts]);
        }
      }
      opened.push(gene);
    });
    let height = 0;
    //set bounding box for gene and transcripts
    gene_range_v.forEach((pos: number[], gene: Gene) => {
      let start = this.get_gene_start_px(gene);
      let width = this.get_gene_width(gene);
      height = Math.max(pos[1], height);
      let top = (pos[0]) * gene_spacing;
      let bottom = (pos[1]) * gene_spacing + this.gene_height;
      gene.bb = {
        left: start,
        right: start + width,
        top: top,
        bottom: bottom,
      } as Bb;
    });
    return Math.max((height+1) *gene_spacing, 200);
  }

  get_gene_start_px(gene: DNA): number {
    return Math.max((gene.start - this.coord.start)*this.get_conversion(), 0)
  }

  get_gene_width(gene: DNA): number{
    let start = Math.max(gene.start, this.coord.start)
    let end = Math.min(gene.end, this.coord.end)
    return Math.max(1, (end-start)*this.get_conversion());
  }

  draw_exons(): void{
    let spacing = this.gene_spacing;
    this.genes.forEach((gene: Gene) =>{

      let transcripts = gene.mRNA.length;
      for(let i = 0; i < transcripts; i++){

        let offset = spacing * i;
        let top = gene.bb.top + offset;
        this.ctx.fillStyle = "#3399ff";
        let transcript_start = this.get_gene_start_px(gene.mRNA[i]);
        let transcript_width = this.get_gene_width(gene.mRNA[i]);
        this.draw_rounded_rect(transcript_start, top+9, 
                               transcript_width, 2, 0);

        let prev = Number.MAX_VALUE;
        gene.mRNA[i].exon.forEach((exon: Exon) =>{
          let start_px = this.get_gene_start_px(exon)
          if(start_px - prev > 10){
            let mid = (start_px + prev)/2
            let arrow_height = this.gene_height;
            let arrow_top = (this.gene_height -arrow_height)/2
            this.ctx.strokeStyle = "black";
            let is_right = true;
            if(gene.mRNA[i].strand == Strand.negative){
              is_right = false;
            }
            this.draw_triangle(mid-5, 
                               mid+5, 
                               top + arrow_top, 
                               top + this.gene_height - arrow_top, 
                               is_right); 
          }
          let width = this.get_gene_width(exon);
          prev = start_px + width;
          this.ctx.fillStyle = "#3399ff";
          this.draw_rounded_rect(start_px, top, width, this.gene_height, 5);
        });
      }
      if(this.is_labeled){
        this.ctx.fillStyle = "black";
        this.ctx.fillText(gene.gene_name, gene.bb.left, gene.bb.top - 5);
      }
    });
  }

  draw_triangle(left: number, right: number, top: number, bottom: number, point_right: boolean): void{
    this.ctx.beginPath();
    if(point_right){
      this.ctx.moveTo(left, top);
      this.ctx.lineTo(right, (top+bottom)/2);
      this.ctx.lineTo(left, bottom);
    }else{
      this.ctx.moveTo(right, top);
      this.ctx.lineTo(left, (top+bottom)/2);
      this.ctx.lineTo(right, bottom);
    }
    this.ctx.stroke();
  }
}
