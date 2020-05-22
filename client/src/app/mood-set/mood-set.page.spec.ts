import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MoodSetPage } from './mood-set.page';

describe('MoodSetPage', () => {
  let component: MoodSetPage;
  let fixture: ComponentFixture<MoodSetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoodSetPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MoodSetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
