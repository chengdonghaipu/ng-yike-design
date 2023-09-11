/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Directive } from '@angular/core';

import { useHostDom } from 'ng-yk-design/core';

import {
  OffsetResponsiveInputs,
  PullResponsiveInputs,
  SpanResponsiveInputs,
  useOffsetResponsive,
  usePullResponsive,
  useSpanResponsive
} from './responsive';

@Directive({
  selector:
    'nx-col[span.xs], nx-col[span.sm], nx-col[span.md],' +
    'nx-col[span.lg], nx-col[span.xl], nx-col[span.xxl], nx-col[span.gt-xs],' +
    'nx-col[span.lt-sm], nx-col[span.gt-sm], nx-col[span.lt-md], nx-col[span.gt-md],' +
    'nx-col[span.lt-lg], nx-col[span.gt-lg], nx-col[span.lt-xl], nx-col[span.gt-xl],' +
    'nx-col[span.lt-xxl],' +
    '[nxCol][span.xs], [nxCol][span.sm], [nxCol][span.md],' +
    '[nxCol][span.lg], [nxCol][span.xl], [nxCol][span.xxl], [nxCol][span.gt-xs],' +
    '[nxCol][span.lt-sm], [nxCol][span.gt-sm], [nxCol][span.lt-md], [nxCol][span.gt-md],' +
    '[nxCol][span.lt-lg], [nxCol][span.gt-lg], [nxCol][span.lt-xl], [nxCol][span.gt-xl],' +
    '[nxCol][span.lt-xxl]',
  standalone: true
})
export class NxSpanResponsiveDirective extends SpanResponsiveInputs {
  private readonly hostDom = useHostDom();
  constructor() {
    super();
    useSpanResponsive.call(this, this.hostDom);
  }
}

@Directive({
  selector:
    'nx-col[pull.xs], nx-col[pull.sm], nx-col[pull.md],' +
    'nx-col[pull.lg], nx-col[pull.xl], nx-col[pull.xxl], nx-col[pull.gt-xs],' +
    'nx-col[pull.lt-sm], nx-col[pull.gt-sm], nx-col[pull.lt-md], nx-col[pull.gt-md],' +
    'nx-col[pull.lt-lg], nx-col[pull.gt-lg], nx-col[pull.lt-xl], nx-col[pull.gt-xl],' +
    'nx-col[pull.lt-xxl],' +
    '[nxCol][pull.xs], [nxCol][pull.sm], [nxCol][pull.md],' +
    '[nxCol][pull.lg], [nxCol][pull.xl], [nxCol][pull.xxl], [nxCol][pull.gt-xs],' +
    '[nxCol][pull.lt-sm], [nxCol][pull.gt-sm], [nxCol][pull.lt-md], [nxCol][pull.gt-md],' +
    '[nxCol][pull.lt-lg], [nxCol][pull.gt-lg], [nxCol][pull.lt-xl], [nxCol][pull.gt-xl],' +
    '[nxCol][pull.lt-xxl]',
  standalone: true
})
export class NxPullResponsiveDirective extends PullResponsiveInputs {
  private readonly hostDom = useHostDom();
  constructor() {
    super();
    usePullResponsive.call(this, this.hostDom);
  }
}

@Directive({
  selector:
    'nx-col[offset.xs], nx-col[offset.sm], nx-col[offset.md],' +
    'nx-col[offset.lg], nx-col[offset.xl], nx-col[offset.xxl], nx-col[offset.gt-xs],' +
    'nx-col[offset.lt-sm], nx-col[offset.gt-sm], nx-col[offset.lt-md], nx-col[offset.gt-md],' +
    'nx-col[offset.lt-lg], nx-col[offset.gt-lg], nx-col[offset.lt-xl], nx-col[offset.gt-xl],' +
    'nx-col[offset.lt-xxl],' +
    '[nxCol][offset.xs], [nxCol][offset.sm], [nxCol][offset.md],' +
    '[nxCol][offset.lg], [nxCol][offset.xl], [nxCol][offset.xxl], [nxCol][offset.gt-xs],' +
    '[nxCol][offset.lt-sm], [nxCol][offset.gt-sm], [nxCol][offset.lt-md], [nxCol][offset.gt-md],' +
    '[nxCol][offset.lt-lg], [nxCol][offset.gt-lg], [nxCol][offset.lt-xl], [nxCol][offset.gt-xl],' +
    '[nxCol][offset.lt-xxl]',
  standalone: true
})
export class NxPOffsetResponsiveDirective extends OffsetResponsiveInputs {
  private readonly hostDom = useHostDom();
  constructor() {
    super();
    useOffsetResponsive.call(this, this.hostDom);
  }
}
