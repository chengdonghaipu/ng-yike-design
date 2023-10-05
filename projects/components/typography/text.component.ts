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
  effect,
  Input,
  signal,
  ViewEncapsulation
} from '@angular/core';

import { onChanges, useHostDom } from 'ng-yk-design/core';
import { getCssVar, watchInputs } from 'ng-yk-design/core/util';

import { TypeInput, withTypeInput } from './with-type';

interface TextUiInputs {
  disabled: boolean;
  strong: boolean;
  mark: boolean;
  underline: boolean;
  del: boolean;
}

function withTextUiInputs<T extends TextUiInputs>(this: T): void {
  const { setHostStyles } = useHostDom();

  const nxDisabled = signal(this.disabled);
  const nxStrong = signal(this.strong);
  const nxMark = signal(this.mark);
  const nxUnderline = signal(this.underline);
  const nxDel = signal(this.del);

  const computedStyle = computed(() => {
    const disabled = nxDisabled();
    const strong = nxStrong();
    const mark = nxMark();
    const underline = nxUnderline();
    const del = nxDel();

    const style: Partial<CSSStyleDeclaration> = {
      ...(disabled && { color: `rgba(${getCssVar('color', ['info-rgb'])}, .32)`, cursor: 'not-allowed' }),
      ...(underline && { textDecoration: 'underline' }),
      ...(strong && { fontWeight: 'bold' }),
      ...(mark && { backgroundColor: '#ffd61c7a' }),
      ...(del && { textDecoration: 'line-through' })
    };

    return style;
  });

  effect(() => setHostStyles(computedStyle()));

  onChanges.call(
    this,
    watchInputs(['disabled', 'strong', 'mark', 'underline', 'del'], (key, change) => {
      key === 'disabled' && nxDisabled.set(change.currentValue);
      key === 'strong' && nxStrong.set(change.currentValue);
      key === 'mark' && nxMark.set(change.currentValue);
      key === 'underline' && nxUnderline.set(change.currentValue);
      key === 'del' && nxDel.set(change.currentValue);
    })
  );
}

@Component({
  selector: 'nx-text, [nx-text]',
  standalone: true,
  imports: [CommonModule],
  template: ` <ng-content></ng-content> `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'yk-typography yk-typography-text'
  }
})
export class NxTextComponent implements TypeInput, TextUiInputs {
  @Input() type?: TypeInput['type'];
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) strong = false;
  @Input({ transform: booleanAttribute }) mark = false;
  @Input({ transform: booleanAttribute }) underline = false;
  @Input({ transform: booleanAttribute }) del = false;

  constructor() {
    withTypeInput.call(this);
    withTextUiInputs.call(this);
  }
}
