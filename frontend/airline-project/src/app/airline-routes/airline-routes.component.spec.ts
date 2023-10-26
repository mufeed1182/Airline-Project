import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineRoutesComponent } from './airline-routes.component';

describe('AirlineRoutesComponent', () => {
  let component: AirlineRoutesComponent;
  let fixture: ComponentFixture<AirlineRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AirlineRoutesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AirlineRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
