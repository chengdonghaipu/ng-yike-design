/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Directive, inject, Input, numberAttribute } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HostDom, useHostDom } from 'ng-yk-design/core';

import { NxRowDirective } from './row.directive';

function useUpdateHostStyles(hostDom: HostDom): void {
  const rowDirective = inject(NxRowDirective, { optional: true });

  if (!rowDirective) {
    return;
  }

  rowDirective.gutter$.pipe(takeUntilDestroyed()).subscribe(([mainAxis, crossAxis]) => {
    if (crossAxis === 0) {
      hostDom.setHostStyle('paddingLeft', `${mainAxis}px`);
      hostDom.setHostStyle('paddingRight', `${mainAxis}px`);
      return;
    }

    hostDom.setHostStyle('padding', `${mainAxis}px ${crossAxis}px`);
  });
}

@Directive({
  selector: '[nxCol], nx-col',
  standalone: true,
  host: {
    class: 'yk-flex-col'
  }
})
export class NxColDirective {
  private readonly hostDom = useHostDom();

  @Input({ transform: numberAttribute }) set nxSpan(value: number) {
    this.hostDom.setHostStyles({
      maxWidth: `${(value / 24) * 100}%`,
      flex: `0 0 ${(value / 24) * 100}%`
    });
  }

  constructor() {
    useUpdateHostStyles(this.hostDom);
  }
}
