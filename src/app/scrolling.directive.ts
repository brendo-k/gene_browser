import { Directive, HostListener, OnInit, Input, ElementRef } from '@angular/core';
import { BrowserStateService } from './browser-state.service';
import { AnimationService } from './animation.service';
import { Coord } from './coord';

@Directive({
  selector: '[appScrolling]'
})

export class ScrollingDirective implements OnInit {
  mouse_down: boolean
  prev_x: number;
  mouse_down_x: number;
  range: number;

  @Input('appScrolling') width: number;

  @HostListener('mousedown', ['$event'])
  onClick(event: MouseEvent){
    this.prev_x = event.x; 
    this.mouse_down_x = event.x;
    this.mouse_down = true;
  }

  @HostListener('mousemove', ['$event'])
  onMove(event: MouseEvent){
    if(this.mouse_down){
      this.animation.start_moving_animation(event.x - this.prev_x);
      this.prev_x = event.x;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onUp(event: MouseEvent) {
    if(this.mouse_down){
      let diff = this.mouse_down_x - event.x;
      if(diff != 0){
        let bp_px = this.range/this.width;
        let coord: Coord = this.browser_state.get_coord();
        let {start, end} = coord
        end += Math.ceil(bp_px * diff)
        start += Math.ceil(bp_px * diff)

        if(start < 1){
          let diff = coord.start - 1
          this.browser_state.set_coord(1, coord.end-diff, false);
        }else if (end > this.browser_state.genome_size){
          let diff = this.browser_state.genome_size - coord.end;
          this.browser_state.set_coord(coord.start + diff, this.browser_state.genome_size, false);
        }else if (start >= 1 && end <= this.browser_state.genome_size){
          this.browser_state.set_coord(start, end, false);
        }else{
          throw Error('something is wrong idk what');
        }
      }
    }
    this.mouse_down = false;
  }

  constructor(private browser_state: BrowserStateService, 
             private animation: AnimationService) { }

  ngOnInit(): void {
    let coord: Coord = this.browser_state.get_coord();
    this.range = coord.end - coord.start;
    this.browser_state.coord$.subscribe((coord: Coord) => {
      this.range = coord.end - coord.start;
    });
  }

}
