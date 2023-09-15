/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  effect,
  Input,
  signal,
  ViewEncapsulation
} from '@angular/core';

import { onChanges, TypeObject, useHostDom } from 'ng-yk-design/core';
import { getCssVar, watchInputs } from 'ng-yk-design/core/util';

type numberInput = number | string;
type NxSize = 'small' | 'medium' | 'large' | 'xLarge' | numberInput | [numberInput, numberInput];
type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';
type LayoutDirection = 'vertical' | 'horizontal';

interface NxSpaceInputs {
  nxSize: NxSize;
  wrap: string | boolean;
  nxAlign: AlignItems | null;
  nxDirection: LayoutDirection | null;
}

function withSpaceInputs<T extends NxSpaceInputs>(this: T): void {
  const { setHostStyles } = useHostDom();

  const nxSize = signal<NxSize>(this.nxSize);
  const nxWrap = signal(this.wrap);
  const nxAlign = signal(this.nxAlign);
  const nxDirection = signal(this.nxDirection);

  const computedSize = computed(() => {
    const size = nxSize();

    const typeSize: NxSize[] = ['small', 'medium', 'large', 'xLarge'];

    if (typeSize.includes(size)) {
      return getCssVar('space', [size as string]);
    }

    return size as string;
  });

  const computedStyle = computed(() => {
    const size = computedSize();
    const wrap = nxWrap();
    const align = nxAlign();
    const direction = nxDirection();

    const directionMap: TypeObject<string> = { vertical: 'column', horizontal: 'row' };

    const style: Partial<CSSStyleDeclaration> = {
      gap: size,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      ...(align && { alignItems: align }),
      ...(direction && { flexDirection: directionMap[direction] })
    };

    return style;
  });

  onChanges.call(
    this,
    watchInputs(['nxSize', 'wrap', 'nxAlign', 'nxDirection'], (key, change) => {
      key === 'nxSize' && nxSize.set(change.currentValue);
      key === 'wrap' && nxWrap.set(change.currentValue);
      key === 'nxAlign' && nxAlign.set(change.currentValue);
      key === 'nxDirection' && nxDirection.set(change.currentValue);
    })
  );

  effect(() => setHostStyles(computedStyle()));
}

@Directive({
  selector: 'nx-space, [nx-space]',
  standalone: true,
  host: {
    class: 'yk-space'
  }
})
export class NxSpaceComponent implements NxSpaceInputs {
  @Input() nxSize: NxSize = 'large';
  @Input({ transform: booleanAttribute }) wrap = false;
  @Input() nxAlign: AlignItems | null = null;
  @Input() nxDirection: LayoutDirection | null = null;

  constructor() {
    withSpaceInputs.call(this);
  }
}
