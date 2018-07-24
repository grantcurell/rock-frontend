import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KitFormComponent } from './kit-form.component';

describe('KitFormComponent', () => {
  let component: KitFormComponent;
  let fixture: ComponentFixture<KitFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KitFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
