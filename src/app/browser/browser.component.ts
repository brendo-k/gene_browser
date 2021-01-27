import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BrowserStateService } from './../browser-state.service';
import { GenomeService } from '../genome.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Gene } from '../gene';
import { Coord } from '../coord';
import { Mrna } from '../mrna';
import { Exon } from '../exon';

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

  width: number;
  child_width: number;

  is_overflow: boolean;
  is_labeled: boolean;
  show_exons: boolean;

  scrollbar_width = 15;
  height = 500;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.width = window.innerWidth*3/4;
    this.child_width = this.width - this.scrollbar_width;
  }

  constructor(private genomeService: GenomeService, private browserState: BrowserStateService) { 
  }

  ngOnInit(): void {
    this.width = window.innerWidth*3/4;
    this.child_width = this.width - this.scrollbar_width;

    //toggle gene labels
    this.is_labeled = this.set_label(this.browserState.get_zoom());
    this.show_exons = this.set_exons(this.browserState.get_zoom());

    //subscribe to coord changes
    this.browserState.coord$.subscribe((coord) => {
      this.coord = coord;
      this.get_genes(coord.start, coord.end);
      if(this.browserState.get_zoom() == 1){
        this.genomeService.get_dna(coord.start, coord.end, "1")
          .subscribe((dna: object[]) =>{
            console.log(coord.start, coord.end);
            console.log(dna);
          });
      }
    })

    //toggle lables on zoom change
    this.browserState.zoom$.subscribe((zoom: number) => {
      this.is_labeled = this.set_label(zoom);
      this.show_exons = this.set_exons(zoom);
    });
    
    this.coord = this.browserState.get_coord();
    //set genes now
    this.get_genes(this.coord.start, this.coord.end);
  }

  //create an observable for querying genes from server
  get_genes(start: number, end: number): void{
    this.genomeService.get_genes(start, end, "1")
     // .pipe(
     //   catchError( () => of(this.genomeService.get_temp_genes()))
     // )
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
          console.log(genes)
          if(this.show_exons){
            console.log('browser show exons');
            this.get_exons();
          }else{
            console.log('pass to child');
            this.pass_to_child();
          }
        });
  }

  pass_to_child():void{
    this.child_genes = this.genes;
    this.child_coords = this.coord;
  }


  toggle_show(bool: boolean){
    this.show_exons = bool;
  }

  get_exons(): void{
    
    if(this.genes.length == 0){
      this.pass_to_child();
    }
    let i = 0; let j = 0;
    this.genes.forEach((gene: Gene) => {
      i += 1;
      this.genomeService.get_mRNA(gene._id).subscribe((mrnas: Mrna[]) => {
        i -= 1;
        gene.mRNA = mrnas;
        mrnas.forEach((mrna: Mrna) =>{
          j += 1;
          this.genomeService.get_exon(mrna._id).subscribe((exon: Exon[]) => {
            mrna.exon = exon;
            j -= 1
            console.log(i,j);
            if(i == 0 && j == 0){
              console.log('reached');
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
}
