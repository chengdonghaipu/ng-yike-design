/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { OnChangeType, OnTouchedType } from 'ng-yk-design/core/types';

@Component({
  selector: 'nx-checkbox-group',
  standalone: true,
  imports: [CommonModule],
  template: ` <p> checkbox-group works! </p> `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxCheckboxGroupComponent),
      multi: true
    }
  ],
  host: {
    class: 'yk-checkbox-group'
  }
})
export class NxCheckboxGroupComponent implements ControlValueAccessor {
  @Input({ transform: booleanAttribute }) checked: boolean = false;
  @Input({ transform: booleanAttribute }) disabled: boolean = false;
  private onChange: OnChangeType = () => {};
  private onTouched: OnTouchedType = () => {};
  registerOnChange(fn: OnChangeType): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  writeValue(obj: unknown): void {}

  constructor(private readonly cdr: ChangeDetectorRef) {}
}
