import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControllerInterfaceComponent } from './controller-interface.component';

describe('ControllerInterfaceComponent', () => {
  let component: ControllerInterfaceComponent;
  let fixture: ComponentFixture<ControllerInterfaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControllerInterfaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControllerInterfaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
