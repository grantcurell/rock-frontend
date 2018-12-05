import {ComponentFixture, TestBed, async} from "@angular/core/testing";
import {KickstartFormComponent} from "./kickstart-form.component";
import {CUSTOM_ELEMENTS_SCHEMA, DebugElement} from "@angular/core";
import {AppModule} from "../app.module";
import {TextInputComponent} from "../text-input/text-input.component";

describe('Kitstart', () => {
  let component: KickstartFormComponent;
  let fixture: ComponentFixture<KickstartFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [AppModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(KickstartFormComponent, {
        set: {
          providers: []
        }
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(KickstartFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));


  it('should create the component', async(() => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  }));
});
