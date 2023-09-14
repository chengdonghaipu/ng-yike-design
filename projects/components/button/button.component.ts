/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { BooleanInput } from '@angular/cdk/coercion';
import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

import { onChanges, useHostDom } from 'ng-yk-design/core';
import { watchInputs } from 'ng-yk-design/core/util';

type NxSize = 'small' | 'medium' | 'large' | 'xLarge';
type NxType = 'primary' | 'secondary' | 'outline';
type NxShape = 'round' | 'circle' | 'square' | 'default';

interface NxSizeInputObject {
  nxSize: NxSize;
}
interface NxTypeInputObject {
  nxType: NxType;
}
interface NxShapeInputObject {
  nxShape: NxShape;
}

function withNxSize<T extends NxSizeInputObject>(this: T): void {
  const hostDom = useHostDom();

  function genClassname(size: NxSize): string {
    return `yk-size-${size}`;
  }
  // this.nxSize

  onChanges.call(
    this,
    watchInputs(['nxSize'], (_, change) => {
      const value = change.currentValue as NxSize;
      hostDom.addClass(genClassname(value));
    })
  );
}

function withNxType<T extends NxTypeInputObject>(this: T): void {
  const hostDom = useHostDom();

  onChanges.call(
    this,
    watchInputs(['nxType'], (_, change) => {
      const value = change.currentValue as NxType;
      hostDom.addClass(`yk-type-${value}`);
    })
  );
}
function withNxShape<T extends NxShapeInputObject>(this: T): void {
  const hostDom = useHostDom();

  onChanges.call(
    this,
    watchInputs(['nxShape'], (_, change) => {
      const value = change.currentValue as NxType;
      hostDom.addClass(`yk-shape-${value}`);
    })
  );
}
@Component({
  selector: 'button[nx-button], a[nx-button]',
  standalone: true,
  exportAs: 'nxButton',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: {
    class: 'yk-btn',
    '[class.yk-type-primary]': `nxType === 'primary'`,
    '[class.yk-type-secondary]': `nxType === 'secondary'`,
    '[class.yk-type-outline]': `nxType === 'outline'`,
    '[class.yk-size-small]': `nxSize === 'small'`,
    '[class.yk-size-medium]': `nxSize === 'medium'`,
    '[class.yk-size-large]': `nxSize === 'large'`,
    '[class.yk-size-xLarge]': `nxSize === 'xLarge'`
  }
})
export class NxButtonComponent {
  // static ngAcceptInputType_nxLoading: BooleanInput;

  @Input() nxType: NxType = 'primary';
  @Input() nxSize: NxSize = 'large';
  @Input() nxShape: NxShape = 'default';
  @Input({ transform: booleanAttribute }) nxLoading: boolean = false;

  constructor() {
    // withNxSize.call(this);
    // withNxType.call(this);
    withNxShape.call(this);
  }
}
