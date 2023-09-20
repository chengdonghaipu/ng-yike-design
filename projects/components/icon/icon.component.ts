/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, Input, signal, ViewEncapsulation } from '@angular/core';

import { onChanges, useHostDom } from 'ng-yk-design/core';
import { watchInputs } from 'ng-yk-design/core/util';

import { STATIC_ICONS } from './provide-icons';

interface NxIconInputs {
  type?: 'fill' | 'outline';
  icon: string;
  size: string;
}

function withInputs<T extends NxIconInputs>(this: T): void {
  const { renderer, element, setHostStyle } = useHostDom();
  const staticIcons = inject(STATIC_ICONS, { optional: true }) || [];
  const staticFlatIcons = staticIcons.flat();

  function appendSvg(svg: SVGElement): void {
    renderer.appendChild(element(), svg);
  }

  const nxType = signal(this.type);
  const nxIcon = signal(this.icon);
  const nxSize = signal(this.size);

  function createSvgFormString(svg: string): SVGElement | null {
    const div = renderer.createElement('div') as HTMLElement;
    div.innerHTML = svg;
    const element = div.querySelector('svg') as SVGElement | null;

    if (element) {
      renderer.setAttribute(element, 'fill', 'currentColor');
      renderer.setAttribute(element, 'width', '1em');
      renderer.setAttribute(element, 'height', '1em');
    }
    return div.querySelector('svg') as SVGElement | null;
  }

  onChanges.call(
    this,
    watchInputs(['type', 'icon', 'size'], (key, change) => {
      key === 'type' && nxType.set(change.currentValue);
      key === 'icon' && nxIcon.set(change.currentValue);
      key === 'size' && nxSize.set(change.currentValue);
    })
  );

  effect(() => {
    const size = nxSize();

    if (!size) {
      return;
    }

    setHostStyle('fontSize', size);
  });

  effect(() => {
    const icon = nxIcon();
    const type = nxType();
    const staticIcon = staticFlatIcons.find(item => {
      return item.name === icon && (type ? type === item.type : true);
    });

    if (staticIcon) {
      const svgElement = createSvgFormString(staticIcon.icon);

      if (!svgElement) {
        return;
      }

      appendSvg(svgElement);
    }
  });
}

@Component({
  selector: 'nx-icon, [nx-icon]',
  standalone: true,
  imports: [CommonModule],
  template: ` <ng-content></ng-content> `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'yk-icon'
  }
})
export class NxIconComponent {
  @Input() type?: 'fill' | 'outline';

  @Input({ required: true }) icon!: string;

  @Input() size!: string;

  constructor() {
    withInputs.call(this);
  }
}
