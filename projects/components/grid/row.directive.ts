/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Directive, ElementRef, HostBinding, inject, Input, Renderer2 } from '@angular/core';

import { TypeObject } from 'ng-yk-design/core';

import { AlignItems, JustifyContent } from './types';

@Directive({
  selector: '[nxRow], nx-row',
  exportAs: 'nxRow',
  standalone: true,
  host: {
    class: 'yk-row'
  }
})
export class NxRowDirective {
  private readonly renderer = inject(Renderer2);
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private get element(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  @Input() set nxJustify(type: JustifyContent | null) {
    if (type === null) {
      this.renderer.removeStyle(this.element, 'justify-content');
      return;
    }

    const flexMap: TypeObject<string> = {
      start: 'flex-start',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around'
    };

    this.renderer.setStyle(this.element, 'justify-content', flexMap[type] ?? type);
  }

  @Input() set nxAlign(type: AlignItems | null) {
    if (type === null) {
      this.renderer.removeStyle(this.element, 'align-items');
      return;
    }

    const flexMap: TypeObject<string> = { start: 'flex-start', end: 'flex-end' };
    this.renderer.setStyle(this.element, 'align-items', flexMap[type] ?? type);
  }
}
