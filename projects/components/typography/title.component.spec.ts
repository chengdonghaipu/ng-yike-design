import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxTitleComponent } from './title.component';

describe('TitleComponent', () => {
  let component: NxTitleComponent;
  let fixture: ComponentFixture<NxTitleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxTitleComponent]
    });
    fixture = TestBed.createComponent(NxTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
