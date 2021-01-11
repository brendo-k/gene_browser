import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Coord } from './coord';

@Injectable({
  providedIn: 'root'
})
export class BrowserStateService {
  
  zoom: number;
  zoom$: Subject<number>;
  coord: Coord;
  coord$: Subject<Coord>;
  genome_size: number;

  constructor() { 

    this.zoom$ = new Subject<number>();
    this.coord$ = new Subject<Coord>();
    this.zoom$.subscribe((value) => {
      this.zoom = value;
    })
    this.coord$.subscribe((value) => {
      this.coord = value;
    })
    this.set_zoom(0);
    this.coord = {
      start: 1,
      end: 228798,
    }

    //TODO: Load the genome size from server depending on chromosome
    this.genome_size = 156040895;
    
  }

  set_coord(start: number, end: number){
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
    this.coord$.next(coord);
  }

  get_coord(){
    return this.coord;
  }

  change_zoom(change:number){
    let new_zoom = this.zoom + change;
    if (new_zoom <= 10 && new_zoom >= 0){
      this.zoom = new_zoom;
      this.zoom$.next(new_zoom);
    }
  }
  
  set_zoom(zoom:number){
    if (zoom <= 10 && zoom >= 0){
      this.zoom = zoom;
      this.zoom$.next(zoom);
    }
  }

  get_zoom(){
    return this.zoom;
  }
}
