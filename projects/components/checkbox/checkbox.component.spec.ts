import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxCheckboxComponent } from './checkbox.component';

describe('CheckboxComponent', () => {
  let component: NxCheckboxComponent;
  let fixture: ComponentFixture<NxCheckboxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxCheckboxComponent]
    });
    fixture = TestBed.createComponent(NxCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
