import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxInputDirective } from './input.directive';

describe('inputComponent', () => {
  let component: NxInputDirective;
  let fixture: ComponentFixture<NxInputDirective>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxInputDirective]
    });
    fixture = TestBed.createComponent(NxInputDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
