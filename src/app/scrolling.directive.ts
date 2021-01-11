import { Directive, HostListener, OnInit, Input } from '@angular/core';
import { BrowserStateService } from './browser-state.service';
import { Coord } from './coord';

@Directive({
  selector: '[appScrolling]'
})

export class ScrollingDirective implements OnInit {
  mouse_down: boolean
  prev_x: number;
  range: number;

  @Input() width: number;

  @HostListener('mousedown', ['$event'])
  onClick(event: MouseEvent){
    this.prev_x = event.x; 
    console.log(`gene: mouse down: ${this.prev_x}`);
    this.mouse_down = true;
  }

  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent){
    if(this.mouse_down){
      let diff = this.prev_x - event.x;
      if(diff != 0){
        let bp_px = this.range/this.width;
        let coord: Coord = this.browser_state.get_coord();
        let {start, end} = coord
        end += Math.floor(bp_px * diff)
        start += Math.floor(bp_px * diff)
        this.prev_x = event.x;
        if(start < 1){
          let diff = coord.start - 1
          this.browser_state.set_coord(1, coord.end-diff);
        }else if (end > this.browser_state.genome_size){
          let diff = this.browser_state.genome_size - coord.end;
          this.browser_state.set_coord(coord.start + diff, this.browser_state.genome_size);
        }else if (start >= 1 && end <= this.browser_state.genome_size){
          this.browser_state.set_coord(start, end);
        }
      }
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onUp(event: MouseEvent) {
    this.mouse_down = false;
  }

  constructor(private browser_state: BrowserStateService) { }

  ngOnInit(): void {
    let coord: Coord = this.browser_state.get_coord();
    this.range = coord.end - coord.start;
    this.browser_state.coord$.subscribe((coord: Coord) => {
      this.range = coord.end - coord.start;
    });
  }

}
