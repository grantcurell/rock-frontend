import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfluenceComponent } from './confluence.component';

describe('ConfluenceComponent', () => {
  let component: ConfluenceComponent;
  let fixture: ComponentFixture<ConfluenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfluenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfluenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
