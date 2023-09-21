import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxAnchorListComponent } from './anchor-list.component';

describe('AnchorListComponent', () => {
  let component: NxAnchorListComponent;
  let fixture: ComponentFixture<NxAnchorListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxAnchorListComponent]
    });
    fixture = TestBed.createComponent(NxAnchorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
