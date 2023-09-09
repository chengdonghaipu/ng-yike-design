/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Directive, Input, numberAttribute } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { TypeObject, useHostDom } from 'ng-yk-design/core';

import { AlignItems, FlexDirection, JustifyContent } from './types';

@Directive({
  selector: '[nxRow], nx-row',
  exportAs: 'nxRow',
  standalone: true,
  host: {
    class: 'yk-flex-row'
  }
})
export class NxRowDirective {
  private readonly hostDom = useHostDom();
  readonly gutter$ = new ReplaySubject<[number, number]>(1);
  @Input({ transform: numberAttribute }) nxColumns: number = 24;
  @Input() set nxGutter(value: number | [number, number]) {
    if (Array.isArray(value)) {
      this.gutter$.next(value);
      return;
    }

    const gutter = numberAttribute(value);
    this.gutter$.next([gutter, 0]);
  }

  @Input() set nxJustify(value: JustifyContent | null) {
    if (value === null) {
      this.hostDom.removeStyle('justifyContent');
      return;
    }

    const flexMap: TypeObject<string> = {
      start: 'flex-start',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly'
    };

    this.hostDom.setHostStyle('justifyContent', flexMap[value] ?? value);
  }

  @Input() set nxAlign(value: AlignItems | null) {
    if (value === null) {
      this.hostDom.removeStyle('alignItems');
      return;
    }

    const flexMap: TypeObject<string> = { start: 'flex-start', end: 'flex-end' };
    this.hostDom.setHostStyle('alignItems', flexMap[value] ?? value);
  }

  @Input() set nxDirection(value: FlexDirection | null) {
    if (value === null) {
      this.hostDom.removeStyle('flexDirection');
      return;
    }

    this.hostDom.setHostStyle('flexDirection', value);
  }
}
