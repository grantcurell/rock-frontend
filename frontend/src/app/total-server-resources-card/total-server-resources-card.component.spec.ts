import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalServerResourcesCardComponent } from './total-server-resources-card.component';

describe('TotalServerResourcesCardComponent', () => {
  let component: TotalServerResourcesCardComponent;
  let fixture: ComponentFixture<TotalServerResourcesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalServerResourcesCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalServerResourcesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
