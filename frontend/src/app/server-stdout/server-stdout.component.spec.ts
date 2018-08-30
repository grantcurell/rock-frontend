import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerStdoutComponent } from './server-stdout.component';

describe('ServerStdoutComponent', () => {
  let component: ServerStdoutComponent;
  let fixture: ComponentFixture<ServerStdoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerStdoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerStdoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
