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
  ContentChildren,
  forwardRef,
  Input,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { OnChangeType, OnTouchedType } from 'ng-yk-design/core/types';
import { NxSpaceComponent } from 'ng-yk-design/space';

import { NxCheckboxComponent } from './checkbox.component';

@Component({
  selector: 'nx-checkbox-group',
  standalone: true,
  exportAs: 'nxCheckboxGroup',
  imports: [CommonModule],
  template: ` <ng-content></ng-content> `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxCheckboxGroupComponent),
      multi: true
    }
  ],
  hostDirectives: [
    {
      directive: NxSpaceComponent,
      inputs: ['nxSize', 'wrap', 'nxAlign', 'nxDirection']
    }
  ],
  host: {
    class: 'yk-checkbox-group'
  }
})
export class NxCheckboxGroupComponent implements ControlValueAccessor {
  @Input({ transform: booleanAttribute }) checked: boolean = false;
  @Input({ transform: booleanAttribute }) disabled: boolean = false;
  @ContentChildren(NxCheckboxComponent, { read: NxCheckboxComponent }) checkboxList!: QueryList<NxCheckboxComponent>;
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
