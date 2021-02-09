import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs'

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

  done: boolean;
  done$: Subject<boolean>;


  constructor() { 
    this.moving = 0;
    this.moving$ = new Subject<number>();
    this.moving$.subscribe((num: number) =>{
      this.moving = num;
    });

    this.done = true;
    this.done$ = new Subject<boolean>();
    this.done$.subscribe((val: boolean) => {
      this.done = val;
    });
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
    this.done$.next(true);
  }
  is_animate(){
    this.done$.next(false);
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
    this.set_moving$.next(amount);
  }

  move_set_done(){
    this.set_moving$.next(null);
  }

  add_animation(animation: any){
    this.animations.push(animation);
  }

  get_is_animate(): boolean{
    return this.done;
  }
}
