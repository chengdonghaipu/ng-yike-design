/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { effect, signal } from '@angular/core';

import { onChanges, TypeObject, useHostDom } from 'ng-yk-design/core';
import { getCssVar, watchInputs } from 'ng-yk-design/core/util';

export interface TypeInput {
  type?: 'secondary' | 'primary' | 'success' | 'warning' | 'danger';
}
export function withTypeInput<T extends TypeInput>(this: T): void {
  const { setHostStyle, removeStyle } = useHostDom();

  const nxType = signal(this.type);

  effect(() => {
    const type = nxType();

    if (!type) {
      removeStyle('color');
      return;
    }

    const typeMap: TypeObject<string> = {
      primary: getCssVar('color', ['primary']),
      success: getCssVar('color', ['success']),
      warning: getCssVar('color', ['warning']),
      danger: getCssVar('color', ['danger']),
      secondary: `rgba(${getCssVar('color', ['info-rgb'])}, .72)`
    };

    if (!typeMap[type]) {
      return;
    }

    setHostStyle('color', typeMap[type]);
  });

  onChanges.call(
    this,
    watchInputs(['type'], (key, change) => {
      key === 'type' && nxType.set(change.currentValue);
    })
  );
}
