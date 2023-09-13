import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: NxButtonComponent;
  let fixture: ComponentFixture<NxButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxButtonComponent]
    });
    fixture = TestBed.createComponent(NxButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
