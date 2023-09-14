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
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  NgZone,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent } from 'rxjs';

import { OnChangeType, OnTouchedType } from 'ng-yk-design/core/types';

let nextUniqueId = 0;

@Component({
  selector: 'nx-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <input
      #inputElement
      type="checkbox"
      class="yk-checkbox-input"
      [checked]="checked"
      [id]="inputId"
      [indeterminate]="indeterminate"
      [disabled]="disabled"
      (blur)="_onBlur()"
      (change)="$event.stopPropagation()"
    />
    <div
      class="yk-checkbox-wrap"
      [class.yk-checkbox-selected]="checked && !indeterminate"
      [class.yk-checkbox-indeterminate]="indeterminate"
    ></div>
    <label class="yk-checkbox-label" [for]="inputId" #label>
      <span><ng-content></ng-content></span>
    </label>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxCheckboxComponent),
      multi: true
    }
  ],
  host: {
    class: 'yk-checkbox'
  }
})
export class NxCheckboxComponent implements ControlValueAccessor, OnInit {
  private onChange: OnChangeType = () => {};
  private onTouched: OnTouchedType = () => {};
  private readonly _uniqueId!: string;
  @Input() id!: string;
  get inputId(): string {
    return `${this.id || this._uniqueId}-input`;
  }
  @ViewChild('inputElement', { static: true }) inputElement!: ElementRef<HTMLInputElement>;
  @Input({ transform: booleanAttribute }) checked: boolean = false;
  @Input({ transform: booleanAttribute }) disabled: boolean = false;
  @Input({ transform: booleanAttribute }) indeterminate: boolean = false;

  // @HostListener('click', ['$event'])
  toggle(): void {
    this.checked = !this.checked;
    this.onChange(this.checked);
  }

  _onBlur(): void {
    Promise.resolve().then(() => {
      this.onTouched();
      this.cdr.markForCheck();
    });
  }

  focus(): void {
    this.inputElement.nativeElement.focus();
  }

  blur(): void {
    this.inputElement.nativeElement.blur();
  }

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

  writeValue(value: boolean): void {
    this.checked = value;
    this.cdr.markForCheck();
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef,
    private readonly ngZone: NgZone
  ) {
    this.id = this._uniqueId = `yk-checkbox-${++nextUniqueId}`;
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.elementRef.nativeElement, 'click')
        // .pipe(takeUntil(this.destroy$))
        .subscribe(event => {
          (event as MouseEvent).preventDefault();
          this.focus();
          if (this.disabled) {
            return;
          }
          this.ngZone.run(() => {
            this.toggle();
            this.cdr.markForCheck();
          });
        });
    });
  }
}