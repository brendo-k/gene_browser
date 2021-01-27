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
    console.log(this.gene);
    if(this.gene){
      let width = this.gene.bb.right - this.gene.bb.left;
      this.left = Math.max(this.gene.bb.left + width/2 - 100, 0);
      this.left = Math.min(this.left, this.width - 200);
      this.top = this.gene.bb.bottom + 30;
      this.arrow_left = this.gene.bb.left - this.left + width/2;
    }else{
      this.left = 0;
      this.top = 0;
      this.arrow_left = 0;
    }
  }

}
