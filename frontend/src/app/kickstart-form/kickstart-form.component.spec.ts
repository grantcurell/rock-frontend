import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KickstartFormComponent } from './kickstart-form.component';

describe('KickstartFormComponent', () => {
  let component: KickstartFormComponent;
  let fixture: ComponentFixture<KickstartFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KickstartFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KickstartFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
