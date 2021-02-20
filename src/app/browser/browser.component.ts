import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BrowserStateService } from './../browser-state.service';
import { GenomeService } from '../genome.service';
import { AnimationService } from '../animation.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Gene } from '../gene';
import { Coord } from '../coord';
import { Mrna } from '../mrna';
import { Exon } from '../exon';
import { LoggerService } from '../logger.service';

@Component({
  selector: 'gene-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.css'],
})
export class BrowserComponent implements OnInit  {
  
  genes: Gene[]; 
  child_genes: Gene[];
  coord: Coord;
  child_coords: Coord;
  dna: string;

  width: number;
  child_width: number;

  is_overflow: boolean;
  is_labeled: boolean;
  show_exons: boolean;
  selected_gene: Gene;
  top_offset: number;
  labeled: boolean;
  show_exons_child: boolean;

  scrollbar_width = 15;
  height = 520;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.width = window.innerWidth*3/4;
    this.child_width = this.width - this.scrollbar_width;
    this.logger.debug('new width from resize', this, this.width, this.child_width);
  }

  constructor(private genomeService: GenomeService, private browserState: BrowserStateService,
              private animation: AnimationService, private logger: LoggerService) { 
  }

  ngOnChanges(){
  }
  ngOnInit(): void {
    this.width = window.innerWidth*3/4;
    this.child_width = this.width - this.scrollbar_width;

    //toggle gene labels
    this.labeled = this.set_label(this.browserState.get_zoom());
    this.show_exons_child = this.set_exons(this.browserState.get_zoom());

    //subscribe to coord changes
    this.browserState.coord$.subscribe((coord) => {
      this.coord = coord;
      this.logger.debug('get genes with cooord', this, coord);
      this.get_genes(coord.start, coord.end);
      if(this.browserState.get_zoom() == 0){
        this.get_dna(coord);
      }else{
        this.dna = null;
        this.logger.debug('set dna to be null', this, this.dna);
      }
    });

    //toggle lables on zoom change
    this.browserState.zoom$.subscribe((zoom: number) => {
      this.labeled = this.set_label(zoom);
      this.show_exons_child = this.set_exons(zoom);
    });
    
    this.coord = this.browserState.get_coord();
    if(this.browserState.get_zoom() == 0){
      this.get_dna(this.coord);
    }
    //set genes now
    this.get_genes(this.coord.start, this.coord.end);
  }

  //create an observable for querying genes from server
  get_genes(start: number, end: number): void{
    this.logger.debug('getting genes', this);
    this.genomeService.get_genes(start, end, this.browserState.get_chromosome())
    .pipe(
      map((gene: any[]) => {
        gene.map((val) => val.bb = null);
        return gene;
      })
    )
    .subscribe(
      (genes) => {
        //set genes on callback
        this.genes = genes;
        this.logger.debug('genes got', this);
        if(this.show_exons_child){
          this.get_exons();
        }else{
          this.pass_to_child();
        }
      });
  }

  pass_to_child():void{
    this.child_genes = this.genes;
    this.child_coords = this.coord;
    this.child_width = this.width - this.scrollbar_width;
    this.is_labeled = this.labeled;
    this.show_exons = this.show_exons_child;
    this.logger.debug('pass to child', this, this.child_width, this.child_coords);
    this.animation.set_width(this.child_width);
  }


  get_hover_gene(gene: Gene){
    this.selected_gene = gene;
  }

  get_exons(): void{
    
    this.logger.debug('getting exons', this, this.genes);
    if(this.genes.length == 0){
      this.pass_to_child();
    }
    let i = 0; let j = 0;

    let gene_map = new Map<string, number>();
    let all_mrnas = new Array<Mrna>();
    let mrna_map = new Map<string, number>();
    let mrna_index_map = new Map<string, number>();
    this.genes.forEach((gene: Gene) => {
      gene_map.set(gene._id, i);
      i += 1;
      //TODO: make faster by indexing on chromosome;
      this.genomeService.get_mRNA(gene._id, gene.chromosome_num).subscribe((mrnas: Mrna[]) => {
        i -= 1;
        this.genes[gene_map.get(mrnas[0].gene)].mRNA = mrnas;

        mrnas.forEach((mrna: any, index: number) =>{
          mrna_map.set(mrna._id, all_mrnas.length);
          mrna_index_map.set(mrna._id, index);
          all_mrnas.push(mrna);
          j += 1;
          this.genomeService.get_exon(mrna._id, gene.chromosome_num).subscribe((exon: Exon[]) => {
            let parent_mrna = all_mrnas[mrna_map.get(exon[0].mrna)];
            let gene_index = gene_map.get(parent_mrna.gene);
            this.genes[gene_index].mRNA[mrna_index_map.get(exon[0].mrna)].exon = exon;
            j -= 1
            if(i == 0 && j == 0){
              this.pass_to_child();
            }
          });
        });
      });
    });

  }

  set_coord(coord: Coord): void{
    this.browserState.set_coord(coord.start, coord.end, false);
  }

  set_label(zoom: number): boolean {
    if (zoom < 5){
      return true
    }else {
      return false
    }
  }

  set_exons(zoom: number): boolean {
    if (zoom < 4){
      return true
    }else {
      return false
    }
  }

  get_dna(coord: Coord): void {
    let range = this.coord.end - this.coord.start;
    let px_to_bp = range/this.width;
    let offset = Math.ceil(this.width*px_to_bp); 

    this.logger.debug('getting dna', this);
    this.genomeService.get_dna(coord.start - offset, coord.end + offset, this.browserState.get_chromosome())
    .subscribe((dna: any[]) =>{
      this.logger.debug('getting dna', this, dna);
      if(dna.length > 1){
        let range = this.coord.end - this.coord.start + 1;
        let px_bp = range/this.width;
        let offset_bp = Math.floor(this.child_width * px_bp);
        let offset_start = this.coord.start - dna[0].start - offset_bp;
        let next_range = dna[0].dna.length - offset_start + 1;
        this.dna = dna[0].dna.substring(offset_start, offset_start + next_range);
        this.dna += dna[1].dna.substring(0, range*3 - next_range + 1);
      }else{
        let range = this.coord.end - this.coord.start;
        let px_bp = range/this.child_width;
        let offset_bp = Math.floor(this.child_width * px_bp);
        let offset_start = this.coord.start - dna[0].start - offset_bp;
        this.dna = dna[0].dna.substring(offset_start, offset_start + range*3)
      }
    });
  }

  toggle_show(gene: Gene){
    if(this.dna != null){
      this.top_offset = 40;
    }else{
      this.top_offset = 18;
    }
    this.selected_gene = gene;
  }
}
