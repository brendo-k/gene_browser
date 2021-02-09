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
  
  @Input()left_offset: number;

  @Input()
  set move_amount(amount: number){

    if(amount != -this.left_offset){
      
      let metadata = this.move(amount);

      this.logger.debug('start animation', this, metadata, this.left_offset);
      const factory = this.builder.build(metadata);
      this.player = factory.create(this.el.nativeElement);
      this.player.play();

      this.player.onDone(() => {
        this.player.destroy();
        if(this.move_amount != -this.left_offset){
          this.logger.debug('stop animation', this);
          this.animation_done.emit(true);
        }
      })
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

  not_move(): AnimationMetadata[]{
    return [
      style({
        left: `-${this.left_offset}px`
      }),
      animate('0s ease'),
    ];
  }


}
