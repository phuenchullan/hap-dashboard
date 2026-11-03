import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsideItem } from './aside-item';

describe('AsideItem', () => {
  let component: AsideItem;
  let fixture: ComponentFixture<AsideItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideItem],
    }).compileComponents();

    fixture = TestBed.createComponent(AsideItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
