import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxSpaceComponent } from './space.component';

describe('SpaceComponent', () => {
  let component: NxSpaceComponent;
  let fixture: ComponentFixture<NxSpaceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxSpaceComponent]
    });
    fixture = TestBed.createComponent(NxSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
