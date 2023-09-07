import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NxRowDirective } from './row.directive';
import { AlignItems } from './types';

@Component({
  template: ` <div nxRow [nxAlign]="align"> </div> `,
  standalone: true,
  imports: [NxRowDirective]
})
export class TestGridComponent {
  flex: string | null = null;
  justify: string | null = null;
  align: AlignItems | null = null;
}

describe('RowDirective', () => {
  let rowElement: HTMLElement;
  let fixture: ComponentFixture<TestGridComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestGridComponent);
    rowElement = fixture.debugElement.query(By.directive(NxRowDirective)).nativeElement;
  });

  it('should apply host classname', () => {
    expect(rowElement.className).toBe('yk-row');
  });

  it('should apply align-items start styles', () => {
    fixture.componentInstance.align = 'start';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toBe('align-items: flex-start;');
  });

  it('should apply align-items end styles', () => {
    fixture.componentInstance.align = 'end';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toBe('align-items: flex-end;');
  });

  it('should apply align-items baseline styles', () => {
    fixture.componentInstance.align = 'baseline';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toBe('align-items: baseline;');
  });

  it('should apply align-items stretch styles', () => {
    fixture.componentInstance.align = 'stretch';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toBe('align-items: stretch;');
  });

  it('should apply clear align-items styles', () => {
    fixture.componentInstance.align = null;
    fixture.detectChanges();
    expect(rowElement.style.cssText).not.toContain('align-items');
  });
});
