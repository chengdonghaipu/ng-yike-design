/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { booleanAttribute, Input, Directive, inject, signal, effect } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

import { onChanges, useHostDom } from 'ng-yk-design/core';
import { OnChangeType, OnTouchedType } from 'ng-yk-design/core/types';
import { watchInputs } from 'ng-yk-design/core/util';

type NxSize = 'small' | 'medium' | 'large' | 'xLarge';

type NxStatus = 'default' | 'warning' | 'danger' | 'success';

const nxSizeList = ['small', 'medium', 'large', 'xLarge'];

interface NxInputUiInputs {
  size: NxSize;
  status: NxStatus;
}

function withInputUiInputs<T extends NxInputUiInputs>(this: T): void {
  const hostDom = useHostDom();
  const statusCls: { [key: string]: boolean } = {};

  const nxSize = signal<NxSize>(this.size);
  const nxStatus = signal<NxStatus>(this.status);

  onChanges.call(
    this,
    watchInputs(['size', 'status'], (key, change) => {
      console.log(change);
      key === 'size' && nxSize.set(change.currentValue);
      key === 'status' && nxStatus.set(change.currentValue);
    })
  );

  effect(() => {
    nxSizeList.forEach(size => {
      hostDom.removeClass(`yk-input-${size}`);
    });
    const size = nxSize();

    hostDom.addClass(`yk-input-${size}`);
  });
  effect(() => {
    const status = nxStatus();
    const cl = `yk-input-${status}`;
    statusCls[cl] = true;
    Object.keys(statusCls).forEach(key => {
      hostDom.removeClass(key);
    });
    hostDom.addClass(cl);
  });
}

@Directive({
  selector: 'input[nx-input],textarea[nx-input]',
  exportAs: 'nxInput',
  standalone: true,
  host: {
    class: 'yk-input',
    '[class.yk-input-disabled]': 'disabled',
    '[class.yk-input-readonly]': 'readonly'
  }
})
export class NxInputDirective implements ControlValueAccessor, NxInputUiInputs {
  #ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });
  hostDom = useHostDom();
  @Input() size: NxSize = 'large';
  @Input() status: NxStatus = 'default';
  private onChange: OnChangeType = () => {};
  private onTouched: OnTouchedType = () => {};
  private readonly _uniqueId!: string;

  get inputId(): string {
    return `${this._uniqueId}-input`;
  }

  @Input({ transform: booleanAttribute })
  get disabled(): boolean {
    if (this.#ngControl && this.#ngControl.disabled !== null) {
      return this.#ngControl.disabled;
    }
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value != null && `${value}` !== 'false';
  }

  _disabled = false;

  @Input({ transform: booleanAttribute })
  get readonly(): boolean {
    return this._readonly;
  }

  set readonly(value: boolean) {
    this._readonly = value != null && `${value}` !== 'false';
  }

  _readonly = false;

  _onBlur(): void {
    Promise.resolve().then(() => {
      this.onTouched();
    });
  }

  focus(): void {
    this.hostDom.element()?.focus();
  }

  blur(): void {
    this.hostDom.element()?.blur();
  }

  registerOnChange(fn: OnChangeType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: boolean): void {}

  constructor() {
    withInputUiInputs.call(this);
  }
}
