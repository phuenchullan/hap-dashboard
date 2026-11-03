import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomTable } from './custom-table';

describe('CustomTable', () => {
  let component: CustomTable;
  let fixture: ComponentFixture<CustomTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomTable],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomTable);
    fixture.componentRef.setInput('headers', ['Name', 'Email']);
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('pageSize', 10);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
