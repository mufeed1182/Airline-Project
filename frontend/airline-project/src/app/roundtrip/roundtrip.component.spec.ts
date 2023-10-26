import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundtripComponent } from './roundtrip.component';

describe('RoundtripComponent', () => {
  let component: RoundtripComponent;
  let fixture: ComponentFixture<RoundtripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundtripComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundtripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
