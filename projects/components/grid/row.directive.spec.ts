import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NxRowDirective } from './row.directive';
import { AlignItems, JustifyContent } from './types';

@Component({
  template: ` <div nxRow [nxAlign]="align" [nxJustify]="justify"> </div> `,
  standalone: true,
  imports: [NxRowDirective]
})
export class TestGridComponent {
  flex: string | null = null;
  justify: JustifyContent | null = null;
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
    expect(rowElement.className).toContain('yk-row');
  });

  it('should apply align-items start styles', () => {
    fixture.componentInstance.align = 'start';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toContain('align-items: flex-start;');
  });

  it('should apply align-items end styles', () => {
    fixture.componentInstance.align = 'end';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toContain('align-items: flex-end;');
  });

  it('should apply align-items baseline styles', () => {
    fixture.componentInstance.align = 'baseline';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toContain('align-items: baseline;');
  });

  it('should apply align-items stretch styles', () => {
    fixture.componentInstance.align = 'stretch';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toContain('align-items: stretch;');
  });

  it('should apply clear align-items styles', () => {
    fixture.componentInstance.align = null;
    fixture.detectChanges();
    expect(rowElement.style.cssText).not.toContain('align-items');
  });

  it('should apply justify-content start styles', () => {
    fixture.componentInstance.justify = 'start';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toContain('justify-content: flex-start;');
  });

  it('should apply justify-content end styles', () => {
    fixture.componentInstance.justify = 'end';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toContain('justify-content: flex-end;');
  });

  it('should apply justify-content between styles', () => {
    fixture.componentInstance.justify = 'between';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toContain('justify-content: space-between;');
  });

  it('should apply justify-content center styles', () => {
    fixture.componentInstance.justify = 'center';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toContain('justify-content: center;');
  });

  it('should apply justify-content around styles', () => {
    fixture.componentInstance.justify = 'around';
    fixture.detectChanges();
    expect(rowElement.style.cssText).toContain('justify-content: space-around;');
  });

  it('should apply clear justify-content styles', () => {
    fixture.componentInstance.justify = null;
    fixture.detectChanges();
    expect(rowElement.style.cssText).not.toContain('justify-content');
  });
});
