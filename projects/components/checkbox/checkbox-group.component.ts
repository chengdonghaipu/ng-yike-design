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
  OnDestroy,
  Output,
  QueryList,
  signal,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { combineLatest, Observable, startWith, Subscription, tap } from 'rxjs';

import { OnChangeType, OnTouchedType } from 'ng-yk-design/core/types';
import { NxSpaceComponent } from 'ng-yk-design/space';

import { NxCheckboxComponent } from './checkbox.component';

export interface NxCheckboxOptions {
  checked?: boolean;
  disabled?: boolean;
  value: string;
  label?: string;
}

@Component({
  selector: 'nx-checkbox-group',
  standalone: true,
  exportAs: 'nxCheckboxGroup',
  imports: [CommonModule, NxSpaceComponent, NxCheckboxComponent],
  template: `
    <ng-content></ng-content>
    <nx-space>
      <ng-container *ngFor="let option of checkboxOptions">
        <nx-checkbox
          [checked]="$any(option).checked"
          [value]="option.value"
          [disabled]="$any(option).disabled"
          (checkedChange)="checkedChange()"
        >
          {{ $any(option).label }}
        </nx-checkbox>
      </ng-container>
    </nx-space>
  `,
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
export class NxCheckboxGroupComponent implements ControlValueAccessor, AfterContentInit, OnDestroy {
  #sourceCheckedSubscription?: Subscription;
  #checkboxListSubscription?: Subscription;
  #checkbox?: NxCheckboxComponent;
  @Input() set checkbox(value: NxCheckboxComponent) {
    this.#checkbox = value;
    this.#sourceCheckedSubscription && this.#sourceCheckedSubscription.unsubscribe();
    this.#sourceCheckedSubscription = value.checkedChange.subscribe(val => {
      this.checkboxList?.forEach(item => {
        item.checked = val;
        item.checkedChange.emit(val);
      });
    });
  }
  @Input() checkboxOptions: NxCheckboxOptions[] = [];
  @Input() checked: string[] = [];
  @Input({ transform: booleanAttribute }) disabled: boolean = false;
  @ContentChildren(NxCheckboxComponent, { read: NxCheckboxComponent })
  private readonly checkboxContentList!: QueryList<NxCheckboxComponent>;
  @Output() readonly optionsCheckedChange = new EventEmitter<NxCheckboxOptions[]>();
  @ViewChildren(NxCheckboxComponent, { read: NxCheckboxComponent })
  private readonly checkboxViewList!: QueryList<NxCheckboxComponent>;
  get checkboxList(): NxCheckboxComponent[] {
    if (!this.checkboxContentList || !this.checkboxViewList) {
      return [];
    }
    return this.checkboxContentList.toArray().concat(this.checkboxViewList.toArray());
  }
  allChecked = signal(false);
  indeterminate = signal(false);
  private onChange?: OnChangeType;
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

  writeValue(value: string[]): void {
    if (!this.onChange) {
      return;
    }

    Promise.resolve().then(() => {
      if (!value) {
        this.checkboxList.forEach(item => {
          item.checked = false;
          item.checkedChange.emit(false);
        });
        return;
      }
      this.checkboxList
        .filter(item => value.includes(item.value))
        .forEach(item => {
          item.checked = true;
          item.checkedChange.emit(true);
        });
    });
  }

  constructor(private readonly cdr: ChangeDetectorRef) {
    effect(() => {
      const indeterminate = this.indeterminate();
      const allChecked = this.allChecked();

      if (!this.#checkbox) {
        return;
      }

      this.#checkbox!.indeterminate = indeterminate;
      this.#checkbox!.checked = allChecked;
    });
  }

  protected checkedChange(): void {
    this.optionsCheckedChange.emit(
      this.checkboxList.map(value => ({
        checked: value.checked,
        disabled: value.disabled,
        value: value.value
      }))
    );
    const allChecked = this.checkboxList.every(value => value.checked);
    const indeterminate = !!this.checkboxList.length && this.checkboxList.some(value => value.checked) && !allChecked;

    this.updateCheckboxList();
    Promise.resolve().then(() => {
      this.allChecked.set(allChecked);
      this.indeterminate.set(indeterminate);
    });
  }

  private updateCheckboxList(): void {
    if (!this.onChange) {
      return;
    }
    const allValue = this.checkboxList.filter(item => item.checked).map(item => item.value);

    this.onChange(allValue);
  }

  ngAfterContentInit(): void {
    this.checkboxContentList.changes
      .pipe(
        startWith(
          this.checkboxContentList.reduce(
            (prevValue, curValue) =>
              prevValue.concat(curValue.checkedChange.asObservable().pipe(startWith(curValue.checked))),
            [] as Array<Observable<boolean>>
          )
        ),
        tap(() => this.#checkboxListSubscription && this.#checkboxListSubscription.unsubscribe())
      )
      .subscribe(value => {
        console.log(value);
        this.#checkboxListSubscription = combineLatest(value as [Observable<boolean>])
          // .pipe(skip(1))
          .subscribe(() => this.checkedChange());
      });
  }

  ngOnDestroy(): void {
    this.#sourceCheckedSubscription && this.#sourceCheckedSubscription.unsubscribe();
    this.#checkboxListSubscription && this.#checkboxListSubscription.unsubscribe();
  }
}
