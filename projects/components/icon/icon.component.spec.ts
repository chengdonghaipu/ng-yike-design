import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxIconComponent } from './icon.component';

describe('IconComponent', () => {
  let component: NxIconComponent;
  let fixture: ComponentFixture<NxIconComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxIconComponent]
    });
    fixture = TestBed.createComponent(NxIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
