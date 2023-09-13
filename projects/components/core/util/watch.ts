/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { OnChanges, SimpleChange, SimpleChanges } from '@angular/core';

export function watchInputs(
  inputs: string[],
  change: (key: string, change: SimpleChange) => void
): OnChanges['ngOnChanges'] {
  return function (changes: SimpleChanges) {
    for (const key of Object.keys(changes)) {
      if (!inputs.includes(key)) {
        continue;
      }

      change(key, changes[key]);
    }
  };
}
