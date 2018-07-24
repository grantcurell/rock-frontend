import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSensorResourcesCardComponent } from './total-sensor-resources-card.component';

describe('TotalSensorResourcesCardComponent', () => {
  let component: TotalSensorResourcesCardComponent;
  let fixture: ComponentFixture<TotalSensorResourcesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalSensorResourcesCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalSensorResourcesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
