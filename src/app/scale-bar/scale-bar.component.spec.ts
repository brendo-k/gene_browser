import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleBarComponent } from './scale-bar.component';

describe('ScaleBarComponent', () => {
  let component: ScaleBarComponent;
  let fixture: ComponentFixture<ScaleBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScaleBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
