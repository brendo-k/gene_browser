import { Component, OnInit } from '@angular/core';
import { Coord } from '../coord';
import { BrowserStateService } from './../browser-state.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {

  zoom: number;
  _zoom: Subscription;
  coord: Coord;
  start: number;
  end: number;
  _coord: Subscription;
  chromosome: string;
  _chromosome: Subscription;


  all_chromosomes: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                              "11", "12", "13", "14", "15", "16", "17", "18" , "19", "20",
                              "21", "22", "23", "X", "Y"]

  constructor(private browserState: BrowserStateService) { 
    this.zoom = browserState.zoom;
    this.coord = browserState.get_coord();
    this.start = this.coord.start;
    this.end = this.coord.end;

    this._zoom = browserState.zoom$.subscribe((value) => {
      this.zoom = value;
    });
    this._coord = browserState.coord$.subscribe((value) => {
      this.coord = value;
      this.start = this.coord.start;
      this.end = this.coord.end;
    });
  }

  ngOnInit(): void {
    this.chromosome = "1";
  }

  changeZoom(change:number = 0): void {
    //console.log("zoom_change " + change);
    this.browserState.change_zoom(change);
  }

  setZoom(): void {
    //console.log("zoom set " + this.zoom);
    this.browserState.set_zoom(this.zoom, false);
  }


  saveInput(): void {
    //console.log(`Input saved ${this.coord}`); 
    this.coord = {
      start: this.start,
      end: this.end,
    }
    this.browserState.set_coord(this.start, this.end, false);
  }

  changeChromosome(): void{
    this.browserState.set_chromosome(this.chromosome);
  }

}
