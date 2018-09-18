import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSelectDialogComponent } from './modal-select-dialog.component';

describe('ModalSelectDialogComponent', () => {
  let component: ModalSelectDialogComponent;
  let fixture: ComponentFixture<ModalSelectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalSelectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
