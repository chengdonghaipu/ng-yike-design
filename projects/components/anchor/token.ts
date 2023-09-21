/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { InjectionToken } from '@angular/core';

export interface NxAnchor {
  clearActive(): void;
  setActive(href: string): void;
}

export const AnchorToken = new InjectionToken<NxAnchor>('');
