/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import {
  booleanAttribute,
  Directive,
  Input,
  numberAttribute,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges
} from '@angular/core';

import { HostDom, TypeObject, useHostDom } from 'ng-yk-design/core';
import { useResize } from 'ng-yk-design/core/util';

import { AlignItems, FlexDirection, JustifyContent } from './types';

@Directive()
class RowInputs {
  @Input('nowrap') nowrap!: boolean | string;
  @Input('wrap') wrap!: boolean | string;
  @Input('wrap.reverse') wrapReverse!: boolean | string;
}

function useInputs(this: RowInputs, hostDom: HostDom): OnChanges {
  const inputs = ['nowrap', 'wrap', 'wrapReverse'];
  const wrapMap: TypeObject<string> = {
    wrapReverse: 'wrap-reverse'
  };

  const ngOnChanges = (changes: SimpleChanges): void => {
    for (const key of Object.keys(changes)) {
      if (!inputs.includes(key)) {
        continue;
      }

      const previousValue = booleanAttribute(changes[key].previousValue);
      const currentValue = booleanAttribute(changes[key].currentValue);
      const wrapStyles = wrapMap[key] || key;

      if (previousValue && !currentValue) {
        hostDom.removeStyle('flexWrap');
      } else if (currentValue) {
        hostDom.setHostStyle('flexWrap', wrapStyles);
      }
    }
  };

  return {
    ngOnChanges
  };
}

@Directive({
  selector: '[nxRow], nx-row',
  exportAs: 'nxRow',
  standalone: true,
  host: {
    class: 'yk-flex-row'
  }
})
export class NxRowDirective extends RowInputs implements OnChanges {
  private readonly hostDom = useHostDom();
  readonly gutter = signal<[number, number]>([0, 0]);
  readonly columns = signal(24);

  private inputs = useInputs.call(this, this.hostDom);

  @Input({ transform: numberAttribute }) set nxColumns(value: number) {
    this.columns.set(value);
  }

  @Input() set nxGutter(value: number | [number, number]) {
    if (Array.isArray(value)) {
      this.gutter.set(value);
      return;
    }

    const gutter = numberAttribute(value);
    this.gutter.set([gutter, 0]);
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

  ngOnChanges(changes: SimpleChanges): void {
    this.inputs.ngOnChanges(changes);
  }
}
