import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { BrowserStateService } from '../browser-state.service';
import { Coord } from '../coord';


@Component({
  selector: 'app-scale-bar',
  templateUrl: './scale-bar.component.html',
  styleUrls: ['./scale-bar.component.css']
})

export class ScaleBarComponent implements OnInit {
  start: number;
  end: number;
  img_width: number;
  width: number;
  padding_left: number;
  left: number;
  is_left: boolean;
  is_mouse_down: boolean;

  @ViewChild('chromosome') chromosome: ElementRef;

  @HostListener('window:resize')
  onResize(event) {
      this.update_bounding_box();
  }

  @HostListener('document:mousemove', ['$event'])
  onMove(event: MouseEvent){
      if(this.is_mouse_down){
          console.log('mouse_move');

          //if the mouse is moving inside the bounds of the image
          if(event.x >= this.padding_left && event.x <= this.img_width + this.padding_left){

            if (event.x < this.left) {
              this.is_left = true;
            } else if (event.x > this.left && this.width < 10){
              this.is_left = false;
            }

            //if the mouse is moving more left than let most part
            if(this.is_left){
              if (event.x <= this.left) {

                let diff = this.left - event.x;
                this.width += diff;
                this.left = event.x;

                //if mouse is moving right from left side
              } else if(event.x > this.left && event.x < this.left + this.width){
                let diff = event.x - this.left;
                this.width -= diff;
                this.left = event.x;
              }
            }else{
              this.width = event.x - this.left; 
            }
            //if the mouse if moving right or left from right side
          } else if (event.x < this.padding_left) {
            this.left = this.padding_left;
          } else {
            if(this.width == 0){
              this.left = this.padding_left + this.img_width;
            }
          }
      }
  };
  
  @HostListener('document:mouseup', ['$event'])
  mouseUp(event: MouseEvent){
    if(this.is_mouse_down){
      this.is_mouse_down = false;

      let start = this.left - this.padding_left;
      let end = start + this.width + 1;
      let px_to_bp = this.browserState.genome_size/this.img_width;
      let start_bp = Math.floor(start * px_to_bp);
      let end_bp = Math.floor(end * px_to_bp);
      this.browserState.set_coord(start_bp, end_bp);
    }
  };

  constructor(private browserState: BrowserStateService) { 
    //set starting values
    this.start = browserState.coord.start;
    this.end = browserState.coord.end;
    this.width = 20;
    this.is_mouse_down = false;
    this.is_left = false;

    
    //create listeners
    browserState.coord$.subscribe((value) =>{
      this.start = browserState.coord.start;
      this.end = browserState.coord.end;
      this.update_bounding_box();
    });
  }


  ngOnInit(): void {
  }

  //callback when image loads
  onLoad(): void {
    let image_html = (this.chromosome.nativeElement as HTMLImageElement)
    //prevent dragging of ghost imgages
    image_html.ondragstart = () => false;
    this.img_width = image_html.width;
    this.update_bounding_box();
  }

  update_bounding_box(): void {
    console.log(`updating bounding box`);
    let padding_pixels = window.getComputedStyle(this.chromosome.nativeElement).marginLeft;

    this.padding_left = parseInt(padding_pixels.substring(0, padding_pixels.length - 2));
    let range = this.end - this.start + 1;
    let bp_to_px = this.img_width/this.browserState.genome_size;
    this.width = range * bp_to_px;

    let start_begin = this.start * bp_to_px;
    this.left = start_begin + this.padding_left;
    
  }

  mouse_down(event: MouseEvent): void {
      console.log("mouse click");
      this.left = event.x;
      this.width = 0;
      this.is_mouse_down = true;
  }
}
