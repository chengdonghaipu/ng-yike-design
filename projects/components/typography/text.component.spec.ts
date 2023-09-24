import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NxTextComponent } from './text.component';

describe('TextComponent', () => {
  let component: NxTextComponent;
  let fixture: ComponentFixture<NxTextComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NxTextComponent]
    });
    fixture = TestBed.createComponent(NxTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
