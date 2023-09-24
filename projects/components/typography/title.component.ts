/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Input,
  numberAttribute,
  signal,
  ViewEncapsulation
} from '@angular/core';

import { onChanges, useHostDom } from 'ng-yk-design/core';
import { watchInputs } from 'ng-yk-design/core/util';

interface NxSpaceTitleInputs {
  level?: 1 | 2 | 3 | 4 | 5 | '1' | '2' | '3' | '4' | '5';
}

function withTitleInputs<T extends NxSpaceTitleInputs>(this: T): void {
  const { addClass, element, removePrefixClass } = useHostDom();

  const nxLevel = signal<number>(this.level as number);

  effect(() => {
    const classPrefix = `yk-typography-title-`;
    const level = nxLevel();

    removePrefixClass(classPrefix);
    if (!level) {
      return;
    }
    addClass(`${classPrefix}${level}`);
  });

  onChanges.call(
    this,
    watchInputs(['level'], (key, change) => {
      key === 'level' && nxLevel.set(change.currentValue);
    })
  );
}

@Component({
  selector:
    'h1[nx-title]:not([level]), h2[nx-title]:not([level]), h3[nx-title]:not([level]), h4[nx-title]:not([level]), h5[nx-title]:not([level]), nx-title',
  standalone: true,
  imports: [CommonModule],
  template: ` <ng-content></ng-content> `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'yk-typography-title'
  }
})
export class NxTitleComponent implements NxSpaceTitleInputs {
  @Input({ transform: numberAttribute }) level?: NxSpaceTitleInputs['level'];
  constructor() {
    withTitleInputs.call(this);
  }
}
