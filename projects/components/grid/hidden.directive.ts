/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Directive, OnChanges, SimpleChanges } from '@angular/core';

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
    '[nxCol][nxHidden.lt-xxl]',
  standalone: true
})
export class NxHiddenDirective extends HiddenInputs implements OnChanges {
  private readonly hostDom = useHostDom();
  private readonly breakpoint = useBreakpoint();
  private readonly hidden = useHidden.call(this, this.hostDom, this.breakpoint);

  ngOnChanges(changes: SimpleChanges): void {
    this.hidden.ngOnChanges(changes);
  }
}
