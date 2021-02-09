import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';  

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { BrowserComponent } from './browser/browser.component';
import { ScaleBarComponent } from './scale-bar/scale-bar.component';
import { RulerComponent } from './ruler/ruler.component';
import { GeneComponent } from './gene/gene.component';
import { ScrollingDirective } from './scrolling.directive';
import { GenePopupComponent } from './gene-popup/gene-popup.component';
import { DnaRulerComponent } from './dna-ruler/dna-ruler.component';
import { ShowExonsDirective } from './show-exons.directive';
import { ScrollAnimationDirective } from './scroll-animation.directive';


@NgModule({
  declarations: [
    AppComponent,
    ToolBarComponent,
    BrowserComponent,
    ScaleBarComponent,
    RulerComponent,
    GeneComponent,
    ScrollingDirective,
    GenePopupComponent,
    DnaRulerComponent,
    ShowExonsDirective,
    ScrollAnimationDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
