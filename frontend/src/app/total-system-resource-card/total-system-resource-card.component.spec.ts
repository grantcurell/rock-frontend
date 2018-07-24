import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSystemResourceCardComponent } from './total-system-resource-card.component';

describe('TotalSystemResourceCardComponent', () => {
  let component: TotalSystemResourceCardComponent;
  let fixture: ComponentFixture<TotalSystemResourceCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalSystemResourceCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalSystemResourceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
