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
  constructor() { }

  ngOnInit(): void {
  }

}
