import { Component, OnInit, Input } from '@angular/core';
import { Gene } from '../gene';
import { Bb } from '../bb';
import { CommonModule } from '@angular/common';  
    
@Component({
  selector: 'app-gene-popup',
  templateUrl: './gene-popup.component.html',
  styleUrls: ['./gene-popup.component.css']
})
export class GenePopupComponent implements OnInit {

  @Input() gene: Gene;
  @Input() width: number;
  left: number;
  top: number;
  arrow_left: number;
  constructor() { }

  ngOnInit(): void {

  }

  ngOnChanges(): void{
    if(this.gene){
      let vis_start = Math.max(this.width, this.gene.bb.left);
      let vis_end = Math.min(2*this.width, this.gene.bb.right)
      let width = vis_end - vis_start;
      
      this.left = Math.max(vis_start - this.width + width/2 - 100, 0);
      this.left = Math.min(this.left, this.width - 200);

      this.top = this.gene.bb.bottom + 60;
      this.arrow_left = vis_start - this.left - this.width + width/2;
    }else{
      this.left = 0;
      this.top = 0;
      this.arrow_left = 0;
    }
  }

}
