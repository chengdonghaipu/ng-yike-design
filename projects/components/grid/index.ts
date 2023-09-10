/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { NxColDirective } from './col.directive';
import { NxHiddenDirective } from './hidden.directive';
import { NxRowDirective } from './row.directive';

export const NxFlexLayoutModule = [NxColDirective, NxRowDirective, NxHiddenDirective];

export { NxColDirective, NxRowDirective, NxHiddenDirective };
