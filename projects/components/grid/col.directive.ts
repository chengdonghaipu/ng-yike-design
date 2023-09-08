/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Directive, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { useHostDom } from 'ng-yk-design/core';

import { NxRowDirective } from './row.directive';

@Directive({
  selector: '[nxCol], nx-col',
  standalone: true
})
export class ColDirective implements OnInit {
  private readonly hostDom = useHostDom();
  private readonly rowDirective = inject(NxRowDirective, { optional: true });

  ngOnInit(): void {
    if (this.rowDirective) {
      this.rowDirective.gutter$.pipe(takeUntilDestroyed()).subscribe(([mainAxis, crossAxis]) => {
        if (crossAxis === 0) {
          this.hostDom.setHostStyle('paddingLeft', mainAxis);
          this.hostDom.setHostStyle('paddingRight', mainAxis);
          return;
        }

        this.hostDom.setHostStyle('padding', `${mainAxis} ${crossAxis}`);
      });
    }
  }
}
