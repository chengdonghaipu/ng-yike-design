/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Directive } from '@angular/core';

import { useHostDom } from 'ng-yk-design/core';
import { useBreakpoint } from 'ng-yk-design/core/util';

import { SpanResponsiveInputs, useSpanResponsive } from './responsive';

@Directive({
  selector:
    'nx-col[span.xs], nx-col[span.sm], nx-col[span.md],' +
    'nx-col[span.lg], nx-col[span.xl], nx-col[span.xxl], nx-col[span.gt-xs],' +
    'nx-col[span.lt-sm], nx-col[span.gt-sm], nx-col[span.lt-md], nx-col[span.gt-md],' +
    'nx-col[span.lt-lg], nx-col[span.gt-lg], nx-col[span.lt-xl], nx-col[span.gt-xl],' +
    'nx-col[span.lt-xxl],' +
    '[nxCol][nxSpan], [nxCol][span.xs], [nxCol][span.sm], [nxCol][span.md],' +
    '[nxCol][span.lg], [nxCol][span.xl], [nxCol][span.xxl], [nxCol][span.gt-xs],' +
    '[nxCol][span.lt-sm], [nxCol][span.gt-sm], [nxCol][span.lt-md], [nxCol][span.gt-md],' +
    '[nxCol][span.lt-lg], [nxCol][span.gt-lg], [nxCol][span.lt-xl], [nxCol][span.gt-xl],' +
    '[nxCol][span.lt-xxl]',
  standalone: true
})
export class NxSpanResponsiveDirective extends SpanResponsiveInputs {
  private readonly hostDom = useHostDom();
  private readonly breakpoint = useBreakpoint();
  constructor() {
    super();
    useSpanResponsive.call(this, this.hostDom, this.breakpoint);
  }
}
