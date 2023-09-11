/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Directive } from '@angular/core';

import { useHostDom } from 'ng-yk-design/core';
import { useBreakpoint } from 'ng-yk-design/core/util';

import { HiddenInputs, useHidden } from './use-hidden';

@Directive({
  selector:
    'nx-col[nxHidden], nx-col[nxHidden.xs], nx-col[nxHidden.sm], nx-col[nxHidden.md],' +
    'nx-col[nxHidden.lg], nx-col[nxHidden.xl], nx-col[nxHidden.xxl], nx-col[nxHidden.gt-xs],' +
    'nx-col[nxHidden.lt-sm], nx-col[nxHidden.gt-sm], nx-col[nxHidden.lt-md], nx-col[nxHidden.gt-md],' +
    'nx-col[nxHidden.lt-lg], nx-col[nxHidden.gt-lg], nx-col[nxHidden.lt-xl], nx-col[nxHidden.gt-xl],' +
    'nx-col[nxHidden.lt-xxl],' +
    '[nxCol][nxHidden], [nxCol][nxHidden.xs], [nxCol][nxHidden.sm], [nxCol][nxHidden.md],' +
    '[nxCol][nxHidden.lg], [nxCol][nxHidden.xl], [nxCol][nxHidden.xxl], [nxCol][nxHidden.gt-xs],' +
    '[nxCol][nxHidden.lt-sm], [nxCol][nxHidden.gt-sm], [nxCol][nxHidden.lt-md], [nxCol][nxHidden.gt-md],' +
    '[nxCol][nxHidden.lt-lg], [nxCol][nxHidden.gt-lg], [nxCol][nxHidden.lt-xl], [nxCol][nxHidden.gt-xl],' +
    '[nxCol][nxHidden.lt-xxl]' +
    'nx-row[nxHidden], nx-row[nxHidden.xs], nx-row[nxHidden.sm], nx-row[nxHidden.md],' +
    'nx-row[nxHidden.lg], nx-row[nxHidden.xl], nx-row[nxHidden.xxl], nx-row[nxHidden.gt-xs],' +
    'nx-row[nxHidden.lt-sm], nx-row[nxHidden.gt-sm], nx-row[nxHidden.lt-md], nx-row[nxHidden.gt-md],' +
    'nx-row[nxHidden.lt-lg], nx-row[nxHidden.gt-lg], nx-row[nxHidden.lt-xl], nx-row[nxHidden.gt-xl],' +
    'nx-row[nxHidden.lt-xxl],' +
    '[nxRow][nxHidden], [nxRow][nxHidden.xs], [nxRow][nxHidden.sm], [nxRow][nxHidden.md],' +
    '[nxRow][nxHidden.lg], [nxRow][nxHidden.xl], [nxRow][nxHidden.xxl], [nxRow][nxHidden.gt-xs],' +
    '[nxRow][nxHidden.lt-sm], [nxRow][nxHidden.gt-sm], [nxRow][nxHidden.lt-md], [nxRow][nxHidden.gt-md],' +
    '[nxRow][nxHidden.lt-lg], [nxRow][nxHidden.gt-lg], [nxRow][nxHidden.lt-xl], [nxRow][nxHidden.gt-xl],' +
    '[nxRow][nxHidden.lt-xxl]',
  standalone: true
})
export class NxHiddenDirective extends HiddenInputs {
  private readonly hostDom = useHostDom();
  private readonly breakpoint = useBreakpoint();

  constructor() {
    super();
    useHidden.call(this, this.hostDom, this.breakpoint);
  }
}
