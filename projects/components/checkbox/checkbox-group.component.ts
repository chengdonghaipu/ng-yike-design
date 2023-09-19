/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  effect,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  QueryList,
  signal,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { combineLatest, Observable, skip, startWith, Subscription, tap } from 'rxjs';

import { OnChangeType, OnTouchedType } from 'ng-yk-design/core/types';
import { NxSpaceComponent } from 'ng-yk-design/space';

import { NxCheckboxComponent } from './checkbox.component';

export interface NxCheckboxOptions {
  checked: boolean;
  disabled: boolean;
}

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
export class NxCheckboxGroupComponent implements ControlValueAccessor, AfterContentInit {
  @Input({ transform: booleanAttribute }) checked: boolean = false;
  @Input({ transform: booleanAttribute }) disabled: boolean = false;
  @ContentChildren(NxCheckboxComponent, { read: NxCheckboxComponent }) checkboxList!: QueryList<NxCheckboxComponent>;
  @Output() readonly optionsCheckedChange = new EventEmitter<NxCheckboxOptions[]>();
  allChecked = signal(false);
  indeterminate = signal(false);
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

  constructor(private readonly cdr: ChangeDetectorRef) {
    effect(() => {
      const indeterminate = this.indeterminate();
      const allChecked = this.allChecked();
      console.log(indeterminate, allChecked);
    });
  }

  ngAfterContentInit(): void {
    let subscription: Subscription;
    this.checkboxList.changes
      .pipe(
        startWith(
          this.checkboxList.reduce(
            (prevValue, curValue) =>
              prevValue.concat(curValue.checkedChange.asObservable().pipe(startWith(curValue.checked))),
            [] as Array<Observable<boolean>>
          )
        ),
        tap(() => subscription && subscription.unsubscribe())
      )
      .subscribe(value => {
        subscription = combineLatest(value as [Observable<boolean>])
          // .pipe(skip(1))
          .subscribe(v => {
            this.optionsCheckedChange.emit(
              this.checkboxList.map(value => ({
                checked: value.checked,
                disabled: value.disabled
              }))
            );
            const allChecked = this.checkboxList.toArray().every(value => value.checked);
            const indeterminate =
              !!this.checkboxList.length && this.checkboxList.some(value => !value.checked) && !allChecked;
            Promise.resolve().then(() => {
              this.allChecked.set(allChecked);
              this.indeterminate.set(indeterminate);
            });
          });
      });
  }
}
