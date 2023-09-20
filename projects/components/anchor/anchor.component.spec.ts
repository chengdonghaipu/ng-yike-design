import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxAnchorComponent } from './anchor.component';

describe('AnchorComponent', () => {
  let component: NxAnchorComponent;
  let fixture: ComponentFixture<NxAnchorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxAnchorComponent]
    });
    fixture = TestBed.createComponent(NxAnchorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
