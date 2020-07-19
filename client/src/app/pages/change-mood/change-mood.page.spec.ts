import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ChangeMoodPage } from './change-mood.page';

describe('ChangeMoodPage', () => {
  let component: ChangeMoodPage;
  let fixture: ComponentFixture<ChangeMoodPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeMoodPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeMoodPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
