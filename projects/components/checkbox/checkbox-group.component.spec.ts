import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxCheckboxGroupComponent } from './checkbox-group.component';

describe('CheckboxGroupComponent', () => {
  let component: NxCheckboxGroupComponent;
  let fixture: ComponentFixture<NxCheckboxGroupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxCheckboxGroupComponent]
    });
    fixture = TestBed.createComponent(NxCheckboxGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
