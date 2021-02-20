import { Directive, ElementRef, Input, EventEmitter, Output } from '@angular/core';
import { LoggerService } from './logger.service';
import { 
  AnimationMetadata,
  AnimationBuilder,
  AnimationPlayer,
  trigger, 
  animate,
  transition,
  style } from '@angular/animations'

@Directive({
  selector: '[appScrollAnimation]'
})
export class ScrollAnimationDirective {

  player: AnimationPlayer;
  @Output()animation_done: EventEmitter<boolean>

  
  @Input()
  set move_amount(amount: number){
      
    if(this.player){
      console.log(this.player);
      this.player.destroy();
    }
    if(amount != null){
      let metadata = this.move(amount);

      this.logger.debug('start animation', this, metadata, (this.el.nativeElement as HTMLElement).className);
      const factory = this.builder.build(metadata);
      this.player = factory.create(this.el.nativeElement);

      this.player.onDone(() => {
        this.logger.debug('animation done', this);
        this.player.destroy();
        this.animation_done.emit(true);
      });

      this.player.play();
    }
  }

  constructor(private el: ElementRef, private builder: AnimationBuilder,
              private logger: LoggerService) {
    this.animation_done = new EventEmitter<boolean>();
  }

  move(amount: number): AnimationMetadata[]{
    return [
      animate('1s ease', 
      style({
        left: `${amount}px`
      }))
    ]
  }



}
