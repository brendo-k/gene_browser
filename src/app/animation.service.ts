import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs'
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  moving$: Subject<number>;
  moving: number;
  width$: Subject<number>;
  width: number;
  set_moving$: Subject<number>;
  set_moving: number;
  animations: any[];

  done: boolean[];
  done$: Subject<boolean>;


  constructor(private logger: LoggerService) { 
    this.moving = 0;
    this.moving$ = new Subject<number>();
    this.moving$.subscribe((num: number) =>{
      this.moving = num;
    });

    this.done = [];
    this.done$ = new Subject<boolean>();
    
    this.set_moving = 0;
    this.set_moving$ = new Subject<number>();
    this.set_moving$.subscribe((num: number) => {
      this.set_moving = num; 
    });

    this.width$ = new Subject<number>();
    this.width$.subscribe((val) => {
      this.width = val;
    });
  }

  is_done(){
    this.done.pop();
    console.log(this.done);
    if(this.done.length == 0){
      this.logger.debug('animations done', this);
      this.done$.next(true);
    }
  }


  is_animate(){
    this.done.push(true);
  }

  is_animating(){
    if(this.done.length == 0){
      return false;
    }else{
      return true;
    }
  }

  start_moving_animation(trans_x: number): void {
    this.moving$.next(trans_x);
  }

  stop_moving_annimation(): void {
    this.moving$.next(0);
  }

  set_width(width: number): void {
    this.width$.next(width);
  }
  get_width(): number{
    return this.width;
  }

  move_set_amount(amount: number){
    this.logger.debug('move set amount', this, amount);
    this.set_moving$.next(amount);
  }

}
