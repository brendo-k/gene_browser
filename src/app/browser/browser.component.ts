import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BrowserStateService } from './../browser-state.service';
import { GenomeService } from '../genome.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Gene } from '../gene';
import { Coord } from '../coord';

@Component({
  selector: 'gene-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.css'],
})
export class BrowserComponent implements OnInit {
  
  genes: Gene[]; 
  ctx: CanvasRenderingContext2D;
  canvas_container: HTMLElement;
  coord: Coord;
  cvs: HTMLCanvasElement;
  width: number;
  is_labeled: boolean;

  @ViewChild('canvas_container')canvas_container_element: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.width = window.innerWidth*3/4;
  }

  constructor(private genomeService: GenomeService, private browserState: BrowserStateService) { 
  }

  ngOnInit(): void {
    this.width = window.innerWidth*3/4;


    //toggle gene labels
    this.is_labeled = this.set_label(this.browserState.get_zoom());

    //subscribe to coord changes
    this.browserState.coord$.subscribe((coord) => {
      this.coord = coord;
      this.get_genes(coord.start, coord.end);
    })

    //toggle lables on zoom change
    this.browserState.zoom$.subscribe((zoom: number) => {
      this.is_labeled = this.set_label(zoom);
    });
    
    this.coord = this.browserState.get_coord();
    //set genes now
    this.get_genes(this.coord.start, this.coord.end);
  }

  //create an observable for querying genes from server
  get_genes(start: number, end: number): void{
    this.genomeService.get_genes(start, end, "1")
      .pipe(
        catchError( () => of(this.genomeService.get_temp_genes()))
      )
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
          console.log(genes);
        });

  }

  ngAfterViewInit(): void {
  }

  set_label(zoom: number): boolean {
    if (zoom < 5){
      return true
    }else {
      return false
    }
  }

}
