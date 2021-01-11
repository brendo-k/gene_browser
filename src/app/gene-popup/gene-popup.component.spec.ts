import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenePopupComponent } from './gene-popup.component';

describe('GenePopupComponent', () => {
  let component: GenePopupComponent;
  let fixture: ComponentFixture<GenePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
