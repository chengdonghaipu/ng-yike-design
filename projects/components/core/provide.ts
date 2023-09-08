/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { forwardRef, Provider, Type } from '@angular/core';

import { SafaAny } from './types';

export function provideParent(component: Type<SafaAny>, parentType: SafaAny): Provider {
  return { provide: parentType, useExisting: forwardRef(() => component) };
}
