/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { booleanAttribute, Directive, Input, SimpleChanges } from '@angular/core';
import { throttleTime } from 'rxjs';

import { HostDom, onChanges, TypeObject } from 'ng-yk-design/core';
import { UseBreakpointReturn, useResize } from 'ng-yk-design/core/util';

import { convertClassName } from './util';

@Directive()
export class HiddenInputs {
  @Input('nxHidden') nxHidden!: boolean | string;

  @Input('nxHidden.xs') nxHiddenXs!: boolean | string;
  @Input('nxHidden.sm') nxHiddenSm!: boolean | string;
  @Input('nxHidden.md') nxHiddenMd!: boolean | string;
  @Input('nxHidden.lg') nxHiddenLg!: boolean | string;
  @Input('nxHidden.xl') nxHiddenXl!: boolean | string;
  @Input('nxHidden.xxl') nxHiddenXxl!: boolean | string;

  @Input('nxHidden.gt-xs') nxHiddenGtXs!: boolean | string;
  @Input('nxHidden.lt-sm') nxHiddenLtSm!: boolean | string;
  @Input('nxHidden.gt-sm') nxHiddenGtSm!: boolean | string;
  @Input('nxHidden.lt-md') nxHiddenLtMd!: boolean | string;
  @Input('nxHidden.gt-md') nxHiddenGtMd!: boolean | string;
  @Input('nxHidden.lt-lg') nxHiddenLtLg!: boolean | string;
  @Input('nxHidden.gt-lg') nxHiddenGtLg!: boolean | string;
  @Input('nxHidden.lt-xl') nxHiddenLtXl!: boolean | string;
  @Input('nxHidden.gt-xl') nxHiddenGtXl!: boolean | string;
  @Input('nxHidden.lt-xxl') nxHiddenLtXxl!: boolean | string;
  // @Input('nxHidden.gt-xxl') nxHiddenGtXxl!: boolean | string;
}

export function useHidden(this: HiddenInputs, hostDom: HostDom, breakpoint: UseBreakpointReturn): void {
  const { matchesForEach, mediaMatchers } = breakpoint;
  const { hasClass, removeClass, addClass } = hostDom;

  const updateStyle = (state: TypeObject<boolean>): void => {
    const hiddenClass = 'yk-flex-hidden';
    const hidden = hasClass(hiddenClass);
    // console.log(state);
    let needHidden = this.nxHidden;
    matchesForEach(state, (bp, match) => {
      const alias = `nxHidden.${bp}`;
      const input = booleanAttribute(this[convertClassName(alias) as 'nxHidden']);

      if (match && input) {
        needHidden = true;
      }
      // console.log(bp, match);
    });
    // console.log(needHidden, hidden);
    if (needHidden && !hidden) {
      addClass(hiddenClass);
    } else if (!needHidden && hidden) {
      removeClass(hiddenClass);
    }
  };

  // 初始
  updateStyle(mediaMatchers());

  onChanges.call(this, changes => {
    Object.keys(changes).forEach(key => {
      if (!key.concat('nxHidden') && !(key.length <= 'nxHidden'.length)) {
        return;
      }
      const matchers = mediaMatchers();

      updateStyle(matchers);
    });
  });
}
