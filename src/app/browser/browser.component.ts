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

  @ViewChild('canvas_container')canvas_container_element: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.width = window.innerWidth*3/4;
  }

  constructor(private genomeService: GenomeService, private browserState: BrowserStateService) { 
  }

  ngOnInit(): void {
    this.width = window.innerWidth*3/4;

    this.browserState.coord$.subscribe((coord) => {
      this.coord = coord;

      this.genomeService.get_genes(coord.start, coord.end, "1")
        .pipe(
          catchError( () => {
            console.log('reached');
            return of(this.genomeService.get_temp_genes())
          })
        )
        .pipe(
          map((gene: any[]) => {
            gene.map((val) => val.bb = null);
            return gene;
          })
        )
        .subscribe(
          (genes) => {
            this.genes = genes;
            console.log(genes);
          });
    })
    
    this.coord = this.browserState.get_coord();
    console.log(this.genomeService);
    this.genomeService.get_genes(this.coord.start, this.coord.end, "1")
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
          this.genes = genes;
          console.log(genes);
        });
  }

  ngAfterViewInit(): void {
  }

}
