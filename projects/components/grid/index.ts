/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Type } from '@angular/core';

import { SafaAny } from 'ng-yk-design/core';

import { ColDirective } from './col.directive';
import { NxRowDirective } from './row.directive';

export const provideFlexLayoutModule = (): Array<Type<SafaAny>> => {
  return [ColDirective, NxRowDirective];
};

export { ColDirective, NxRowDirective };
