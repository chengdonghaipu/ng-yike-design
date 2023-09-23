/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { booleanAttribute, computed, Directive, effect, Input, signal } from '@angular/core';

import { onChanges, TypeObject, useHostDom } from 'ng-yk-design/core';
import { getCssVar, watchInputs } from 'ng-yk-design/core/util';

type numberInput = number | string;
type NxSize = 'small' | 'medium' | 'large' | 'xLarge' | numberInput | [numberInput, numberInput];
type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';
type LayoutDirection = 'vertical' | 'horizontal';
type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

interface NxSpaceInputs {
  nxSize: NxSize;
  wrap: string | boolean;
  block: string | boolean;
  nxAlign: AlignItems | null;
  nxDirection: LayoutDirection | null;
  justify: JustifyContent | null;
}

function withSpaceInputs<T extends NxSpaceInputs>(this: T): void {
  const { setHostStyles } = useHostDom();

  const nxSize = signal<NxSize>(this.nxSize);
  const nxWrap = signal(this.wrap);
  const nxAlign = signal(this.nxAlign);
  const nxDirection = signal(this.nxDirection);
  const nxBlock = signal(this.block);
  const nxJustify = signal(this.justify);

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
    const block = nxBlock();
    const justify = nxJustify();

    const directionMap: TypeObject<string> = { vertical: 'column', horizontal: 'row' };

    const flexMap: TypeObject<string> = {
      start: 'flex-start',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly'
    };

    const style: Partial<CSSStyleDeclaration> = {
      gap: size,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      ...(align && { alignItems: align }),
      ...(direction && { flexDirection: directionMap[direction] }),
      ...(block && { display: 'flex' }),
      ...(justify && { justifyContent: flexMap[justify] ?? justify })
    };

    return style;
  });

  onChanges.call(
    this,
    watchInputs(['nxSize', 'wrap', 'nxAlign', 'nxDirection', 'block', 'justify'], (key, change) => {
      key === 'nxSize' && nxSize.set(change.currentValue);
      key === 'wrap' && nxWrap.set(change.currentValue);
      key === 'nxAlign' && nxAlign.set(change.currentValue);
      key === 'nxDirection' && nxDirection.set(change.currentValue);
      key === 'block' && nxBlock.set(change.currentValue);
      key === 'justify' && nxJustify.set(change.currentValue);
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
  @Input({ transform: booleanAttribute }) block = false;
  @Input() nxAlign: AlignItems | null = null;
  @Input() nxDirection: LayoutDirection | null = null;
  @Input() justify: JustifyContent | null = null;

  constructor() {
    withSpaceInputs.call(this);
  }
}
