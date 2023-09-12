/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { DOCUMENT } from '@angular/common';
import { Directive, inject, Input, numberAttribute, Renderer2 } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { HostDom, onChanges, SafaAny, useHostDom } from 'ng-yk-design/core';

import { genFlexLayoutCss, styleAppendToHead } from './responsive';
import { NxRowDirective } from './row.directive';

function genFlexLayoutStyle(): void {
  const document = inject(DOCUMENT);
  const render = inject(Renderer2);

  if (document.head.querySelector('style[self-flex-style=true]')) {
    return;
  }

  const styleElement = render.createElement('style');

  render.setAttribute(styleElement, 'self-flex-style', 'true');

  styleAppendToHead(render, genFlexLayoutCss(), styleElement);
}

const inputsMap = {
  nxOrder: {
    update(hostDom: HostDom, value: number) {
      value = numberAttribute(value);

      const classname = `yk-col-order-${value}`;
      hostDom.addClass(classname);
    }
  },
  nxFlex: {
    update(hostDom: HostDom, value: number) {
      hostDom.setHostStyle('flex', parseFlex(value) || '');
    }
  },
  nxSpan: {
    update(hostDom: HostDom, value: number) {
      value = numberAttribute(value);

      const classname = `yk-col-${value}`;
      hostDom.addClass(classname);
    }
  },
  nxOffset: {
    update(hostDom: HostDom, value: number) {
      value = numberAttribute(value);

      const classname = `yk-col-offset-${value}`;
      hostDom.addClass(classname);
    }
  },
  nxPull: {
    update(hostDom: HostDom, value: number) {
      value = numberAttribute(value);

      const classname = `yk-col-pull-${value}`;
      hostDom.addClass(classname);
    }
  },
  nxPush: {
    update(hostDom: HostDom, value: number) {
      value = numberAttribute(value);

      const classname = `yk-col-push-${value}`;
      hostDom.addClass(classname);
    }
  }
};

function parseFlex(flex: number | string | null): string | null {
  if (typeof flex === 'number') {
    return `${flex} ${flex} auto`;
  } else if (typeof flex === 'string') {
    if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) {
      return `0 0 ${flex}`;
    }
  }
  return flex;
}

function useUpdateHostStyles<T extends object>(this: T, hostDom: HostDom): void {
  const rowDirective = inject(NxRowDirective, { optional: true, host: true, skipSelf: true });

  if (!rowDirective) {
    return;
  }

  genFlexLayoutStyle();

  toObservable(rowDirective.gutter).subscribe(([mainAxis, crossAxis]) => {
    if (crossAxis === 0) {
      if (!mainAxis) {
        hostDom.removeStyle('paddingLeft');
        hostDom.removeStyle('paddingRight');
        return;
      }

      hostDom.setHostStyle('paddingLeft', `${mainAxis}px`);
      hostDom.setHostStyle('paddingRight', `${mainAxis}px`);
      return;
    }

    hostDom.setHostStyle('padding', `${mainAxis}px ${crossAxis}px`);
  });

  const inputsName = Object.keys(inputsMap);

  onChanges.call(this, function (changes) {
    Object.keys(changes).forEach(key => {
      if (inputsName.indexOf(key) === -1) {
        return;
      }

      const val = changes[key].currentValue;
      const input = inputsMap[key as keyof typeof inputsMap];
      input.update(hostDom, val);
    });
  });
}

@Directive()
class ColInputs {
  @Input({ transform: numberAttribute }) nxSpan!: number;
  @Input({ transform: numberAttribute }) nxOffset!: number;
  @Input({ transform: numberAttribute }) nxPull!: number;
  @Input({ transform: numberAttribute }) nxPush!: number;
}

@Directive({
  selector: '[nxCol], nx-col',
  standalone: true,
  host: {
    class: 'yk-flex-col'
  }
})
export class NxColDirective extends ColInputs {
  private readonly hostDom = useHostDom();
  @Input() nxFlex: number | string | null = null;
  constructor() {
    super();
    useUpdateHostStyles.call(this, this.hostDom);
  }
}
