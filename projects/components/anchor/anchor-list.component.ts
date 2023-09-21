/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, ViewEncapsulation } from '@angular/core';

import { AnchorToken } from 'ng-yk-design/anchor/token';
import { useHostDom } from 'ng-yk-design/core';

@Component({
  selector: 'nx-anchor-link',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a href="{{ href }}" target="{{ target }}" (click)="goTo($event)">
      {{ title }}
      <!-- <ng-container *ngIf="title; else elseBlock">{{ title }}</ng-container>
      <ng-template #elseBlock>
        <ng-content></ng-content>
      </ng-template>-->
    </a>
    <ng-content></ng-content>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'yk-anchor-link'
  }
})
export class NxAnchorListComponent {
  @Input({ required: true }) href!: string;
  @Input() title = '';
  @Input() target?: string;

  hostDom = useHostDom();
  document = inject(DOCUMENT);
  anchor = inject(AnchorToken, { optional: true });
  goTo(event: MouseEvent): void {
    location.hash = this.href;
    // history.pushState('', '', this.href);
    event.preventDefault();
    event.stopPropagation();
    const target = this.document.querySelector(this.href);

    target?.scrollIntoView({
      behavior: 'smooth'
    });

    this.anchor?.setActive(this.href);
  }

  setActive(): void {
    this.hostDom.addClass('yk-anchor-link-active');
  }

  unsetActive(): void {
    this.hostDom.removeClass('yk-anchor-link-active');
  }
}
