/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChildren,
  inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  QueryList,
  signal,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { fromEvent, Subject, takeUntil, throttleTime } from 'rxjs';

import { NxAnchorListComponent } from './anchor-list.component';
import { AnchorToken, NxAnchor } from './token';

const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });

@Component({
  selector: 'nx-anchor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
    <span class="yk-anchor-marker-ink" [ngStyle]="inkStyle()"></span>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'yk-anchor yk-anchor-marker'
  },
  providers: [{ provide: AnchorToken, useExisting: NxAnchorComponent }]
})
export class NxAnchorComponent implements NxAnchor, OnChanges, OnDestroy, AfterViewInit {
  private readonly scrollEventDestroy$ = new Subject<void>();
  private readonly ngZone = inject(NgZone);
  document = inject(DOCUMENT);
  @ContentChildren(NxAnchorListComponent, { descendants: true }) links!: QueryList<NxAnchorListComponent>;
  @Input() container?: HTMLElement | string;

  get scrollContainer(): HTMLElement | Window {
    if (this.container) {
      if (typeof this.container === 'string') {
        return (this.document.querySelector(this.container) as HTMLElement) || window;
      }
      return this.container;
    }

    return window;
  }

  protected markerTop = signal(-10);
  protected inkStyle = computed(() => {
    const top = this.markerTop();
    return {
      top: `${top}px`,
      opacity: top < 0 ? '0' : '1'
    };
  });

  clearActive(): void {
    this.links?.forEach(item => item.unsetActive());
    this.markerTop.set(-10);
  }

  setActive(href: string): void {
    this.clearActive();
    const link = this.links.find(item => item.href === href);
    link?.setActive();
    this.markerTop.set(link?.hostDom.element().offsetTop || 0);
  }

  private registerScrollEvent(): void {
    this.scrollEventDestroy$.next();

    this.ngZone.runOutsideAngular(() => {
      fromEvent(this.scrollContainer, 'scroll', <AddEventListenerOptions>passiveEventListenerOptions)
        .pipe(throttleTime(50), takeUntil(this.scrollEventDestroy$))
        .subscribe(() => this.handleScroll());
    });

    setTimeout(() => this.handleScroll());
  }

  handleScroll(): void {
    const container = this.scrollContainer;
    const sections = this.links
      .map(item => item.document.querySelector(item.href) as HTMLElement)
      .filter(value => !!value);
    const results = [];

    for (const section of sections) {
      const top = getOffsetTop(section, container);
      top < 4 &&
        results.push({
          top: getOffsetTop(section, container),
          id: section.id
        });
    }

    if (!results.length) {
      this.clearActive();
      return;
    }

    const maxSection = results.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));
    this.ngZone.run(() => this.setActive(`#${maxSection.id}`));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { container } = changes;

    if (container) {
      this.registerScrollEvent();
    }
  }

  ngAfterViewInit(): void {
    this.registerScrollEvent();
  }

  ngOnDestroy(): void {
    this.scrollEventDestroy$.next();
    this.scrollEventDestroy$.complete();
  }
}
export function getOffsetTop(element: HTMLElement, container: HTMLElement | Window): number {
  if (!element || !element.getClientRects().length) {
    return 0;
  }
  const rect = element.getBoundingClientRect();

  if (rect.width || rect.height) {
    if (container === window) {
      const documentElement = element.ownerDocument!.documentElement!;
      return rect.top - documentElement.clientTop;
    }
    return rect.top - (container as HTMLElement).getBoundingClientRect().top;
  }

  return rect.top;
}
