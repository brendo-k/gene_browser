import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Coord } from './coord';
import { DnaLengths } from './dna-lengths.enum';


@Injectable({
  providedIn: 'root'
})
export class BrowserStateService {
  
  zoom: number;
  zoom$: Subject<number>;
  coord: Coord;
  coord$: Subject<Coord>;
  chromosome: string;
  chromosome$: Subject<string>;

  genome_size: number;
  zoom_split: number;

  constructor() { 

    this.zoom$ = new Subject<number>();
    this.coord$ = new Subject<Coord>();
    this.chromosome$ = new Subject<string>();

    //called when zoom is changed
    this.zoom$.subscribe((value) => {
      this.zoom = value;
    })

    this.coord$.subscribe((value) => {
      this.coord = value;
    })
    this.chromosome$.subscribe((value) => {
      this.chromosome = value;
      let name = "chromosome" + value;
      this.genome_size = DnaLengths[name];
    });

    this.coord = {
      start: 69068,
      end: 69118,
    }
    this.set_zoom(0, false);
    this.chromosome = "1";

    //TODO: Load the genome size from server depending on chromosome
    this.genome_size = 156040895;
    this.zoom_split = this.genome_size/10;
  }

  set_coord(start: number, end: number, from_zoom: boolean){
    if (start < 1){
      start = 1;
    }
    if (end > this.genome_size){
      end = this.genome_size;
    }
    let coord: Coord = {
      start: start,
      end: end,
    }
    this.coord = coord
    let new_zoom = this.get_zoom_from_range(coord.end - coord.start);
    if(!from_zoom){
      this.set_zoom(new_zoom, true);
    }
    this.coord$.next(coord);
  }

  get_coord(){
    return this.coord;
 }

  change_zoom(change:number){
    //change zoom from buttons
    let new_zoom = this.zoom + change;
    if (new_zoom <= 10 && new_zoom >= 0){
      this.set_zoom(new_zoom, false);
    }
  }
  
  set_zoom(zoom:number, from_coord: Boolean){

    //check if zoom is valid and correct to valid if not
    if (zoom > 10){
      this.zoom = 10;
    }else if (zoom < 0){
      this.zoom = 0;
    }else if (zoom <= 10 && zoom >= 0){
      this.zoom = zoom;
    }

    //number of bp shown in new zoom range
    let zoom_bp;
    if(this.zoom == 0){
      zoom_bp = 50
    }else if(this.zoom <= 5){
      //first 5 increase exponentially
      zoom_bp = 200 * Math.pow(10, this.zoom);
    } else if(this.zoom <= 7){
      //increase linerally by 2 after
      zoom_bp = 200 * Math.pow(10, 5) * 2 * (2 - (7 - this.zoom));
    }else {
      //increase by zoom_split factor after
      zoom_bp = this.zoom * this.zoom_split;
    }
    //get the difference between cur start and end bp coordinates
    let {start, end} = this.coord 
    let bp_diff = end - start + 1;

    //number of bp to add or remove to get to zoom level
    let bp_change = zoom_bp - bp_diff;
    bp_change = Math.ceil(bp_change/2);
    start -= bp_change;
    end += bp_change;
    if(start < 1){
      end -= (start - 1)
      start = 1
    }
    if(end > this.genome_size){
      let diff = end - this.genome_size;
      start -= diff
      end = this.genome_size;
    }
    
    if(this.zoom == 10){
      start = 1;
      end = this.genome_size;
    }

    if(!from_coord){
      this.set_coord(start, end, true);
    }

    //let observers know of change
    this.zoom$.next(zoom);
  }

  get_zoom(){
    return this.zoom;
  }

  get_zoom_from_range(range: number){
    if (range <= 50){
      return 0;
    } else if (Math.log10(range/200) <= 5) {
      if(0==Math.floor(Math.log10(range/200))){
        return 1;
      }else{
        return Math.floor(Math.log10(range/200))
      }
    } else if (range/(200 * Math.pow(10, 5) * 2) - 5 <= 7){
      //console.log(range/(200 * Math.pow(10, 5) * 2) - 5);
      return Math.floor(range/(200 * Math.pow(10, 5) * 2) + 5);
    }else{
      return Math.ceil(range/this.zoom_split)
    }
  }

  get_chromosome(){
    return this.chromosome;
  }

  set_chromosome(chromosome: string){
    this.chromosome$.next(chromosome);
    this.set_coord(this.coord.start, this.coord.end, false);
  }
}
