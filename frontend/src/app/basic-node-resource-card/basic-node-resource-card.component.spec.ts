import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicNodeResourceCardComponent } from './basic-node-resource-card.component';

describe('BasicNodeResourceCardComponent', () => {
  let component: BasicNodeResourceCardComponent;
  let fixture: ComponentFixture<BasicNodeResourceCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicNodeResourceCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicNodeResourceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
