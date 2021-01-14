import { Component, OnInit } from '@angular/core';
import { Coord } from '../coord';
import { BrowserStateService } from './../browser-state.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.css']
})
export class ToolBarComponent implements OnInit {

  zoom: number;
  _zoom: any;
  coord: Coord;
  start: number;
  end: number;
  _coord: any;

  constructor(private browserState: BrowserStateService) { 
    this.zoom = browserState.zoom;
    this.coord = browserState.get_coord();
    this.start = this.coord.start;
    this.end = this.coord.end;


    this._zoom = browserState.zoom$.subscribe((value) => {
      console.log(`recieved zoom ${value}`);
      this.zoom = value;
      this.start = this.coord.start;
      this.end = this.coord.end;
    });
    this._coord = browserState.coord$.subscribe((value) => {
      console.log(`recieved coord ${value}`);
      this.coord = value;
      this.start = this.coord.start;
      this.end = this.coord.end;
    });
  }

  ngOnInit(): void {
  }

  changeZoom(change:number = 0): void {
    console.log("zoom_change " + change);
    this.browserState.change_zoom(change);
  }

  setZoom(): void {
    console.log("zoom set " + this.zoom);
    this.browserState.set_zoom(this.zoom, false);
  }


  saveInput(): void {
    console.log(`Input saved ${this.coord}`); 
    this.coord = {
      start: this.start,
      end: this.end,
    }
    this.browserState.set_coord(this.start, this.end, false);
  }

}
