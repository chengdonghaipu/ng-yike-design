/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { DOCUMENT } from '@angular/common';
import { computed, Directive, inject, Input, numberAttribute, Renderer2, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, throttleTime } from 'rxjs';

import { HostDom, onChanges, TypeObject } from 'ng-yk-design/core';
import { gridResponsiveMap, UseBreakpointReturn, useResize } from 'ng-yk-design/core/util';
import { NxColDirective } from 'ng-yk-design/grid/col.directive';
import { convertClassName } from 'ng-yk-design/grid/util';

import { NxRowDirective } from './row.directive';

@Directive()
export class SpanResponsiveInputs {
  // @Input({ alias: 'nxSpan', transform: numberAttribute }) nxSpan!: number;
  @Input({ alias: 'span.xs', transform: numberAttribute }) spanXs!: number;
  @Input({ alias: 'span.sm', transform: numberAttribute }) spanSm!: number;
  @Input({ alias: 'span.md', transform: numberAttribute }) spanMd!: number;
  @Input({ alias: 'span.lg', transform: numberAttribute }) spanLg!: number;
  @Input({ alias: 'span.xl', transform: numberAttribute }) spanXl!: number;
  @Input({ alias: 'span.xxl', transform: numberAttribute }) spanXxl!: number;

  @Input({ alias: 'span.gt-xs', transform: numberAttribute }) spanGtXs!: number;
  @Input({ alias: 'span.lt-sm', transform: numberAttribute }) spanLtSm!: number;
  @Input({ alias: 'span.gt-sm', transform: numberAttribute }) spanGtSm!: number;
  @Input({ alias: 'span.lt-md', transform: numberAttribute }) spanLtMd!: number;
  @Input({ alias: 'span.gt-md', transform: numberAttribute }) spanGtMd!: number;
  @Input({ alias: 'span.lt-lg', transform: numberAttribute }) spanLtLg!: number;
  @Input({ alias: 'span.gt-lg', transform: numberAttribute }) spanGtLg!: number;
  @Input({ alias: 'span.lt-xl', transform: numberAttribute }) spanLtXl!: number;
  @Input({ alias: 'span.gt-xl', transform: numberAttribute }) spanGtXl!: number;
  @Input({ alias: 'span.lt-xxl', transform: numberAttribute }) spanLtXxl!: number;
}

function toFixed5(value: number): string {
  return String(parseFloat(value.toFixed(4)));
}

function removeNullProperties<T extends object>(obj: T): T {
  const cleanedObj = { ...obj };

  for (const key in cleanedObj) {
    if (cleanedObj[key] === null) {
      delete cleanedObj[key];
    }
  }

  return cleanedObj;
}

function responsiveColSize(breakpoint: keyof typeof gridResponsiveMap): string {
  const namespace = 'yk';
  const columns = 24;

  function responsive(content: string): string {
    return `@media only screen and ${gridResponsiveMap[breakpoint]} {
  ${content}
}`;
  }

  const content = [];

  for (let i = 0; i <= columns; i++) {
    const pre = toFixed5((i / columns) * 100);
    const colItem = `.${namespace}-col-${breakpoint}-${i} {
  max-width: ${pre}%;
  flex: 0 0 ${pre}%;
}`;
    const offsetItem = `.${namespace}-offset-${breakpoint}-${i} {
  margin-left: ${pre}%;
}`;
    const pushItem = `.${namespace}-push-${breakpoint}-${i} {
  position: relative;
  left: ${pre}%;
}`;
    const pullItem = `.${namespace}-pull-${breakpoint}-${i} {
  position: relative;
  right: ${pre}%;
}`;
    content.push(colItem, offsetItem, pushItem, pullItem);
  }

  return responsive(content.join('\n'));
}

function genResponsiveStyle(): void {
  const document = inject(DOCUMENT);
  const render = inject(Renderer2);

  const styleElement = render.createElement('style');

  const cssContent = [
    responsiveColSize('xs'),
    responsiveColSize('gt-xs'),
    responsiveColSize('lt-sm'),
    responsiveColSize('sm'),
    responsiveColSize('gt-sm'),
    responsiveColSize('lt-md'),
    responsiveColSize('md'),
    responsiveColSize('gt-md'),
    responsiveColSize('lt-lg'),
    responsiveColSize('lg'),
    responsiveColSize('gt-lg'),
    responsiveColSize('lt-xl'),
    responsiveColSize('xl'),
    responsiveColSize('gt-xl'),
    responsiveColSize('lt-xxl'),
    responsiveColSize('xxl')
  ];
  const text = render.createText(cssContent.join('\n'));
  render.appendChild(styleElement, text);
  const linkList = document.head.querySelectorAll('link');

  let firstLink: HTMLLinkElement | null = null;

  for (let i = 0; i < linkList.length; i++) {
    if (linkList.item(i).getAttribute('rel') !== 'stylesheet') {
      continue;
    }

    firstLink = linkList.item(i);
    break;
  }

  if (firstLink) {
    render.insertBefore(document.head, styleElement, firstLink);
    return;
  }

  render.appendChild(document.head, styleElement);
}

export function useSpanResponsive(this: SpanResponsiveInputs, hostDom: HostDom, breakpoint: UseBreakpointReturn): void {
  const { matchesForEach, mediaMatchers } = breakpoint;
  genResponsiveStyle();
  const { hasClass, removeClass, addClass, getHostStyle, setHostStyle, setHostStyles } = hostDom;
  const rowDirective = inject(NxRowDirective, { optional: true, host: true, skipSelf: true });
  const colDirective = inject(NxColDirective, { optional: true, self: true });
  const columns = computed(() => rowDirective?.columns() || 24);
  const nxSpan = (): number | undefined => colDirective?.nxSpan;
  const activeSpan = signal<number | null>(null);

  const maxWidthStyle = signal<string | null>(null);
  const flexStyle = signal<string | null>(null);

  const styleMap = computed(() => ({
    maxWidth: maxWidthStyle(),
    flex: flexStyle()
  }));

  toObservable(styleMap)
    .pipe(map(value => removeNullProperties(value) as CSSStyleDeclaration))
    .subscribe(value => {
      console.log('update', value);
      // setHostStyles(value);
    });
  console.dir(hostDom.element());
  console.log(getHostStyle('cssText'));
  console.log(colDirective, nxSpan());

  toObservable(activeSpan)
    .pipe(
      filter(value => value != null),
      map(value => value as number)
    )
    .subscribe(value => {
      const width = toFixed5((value / columns()) * 100);
      maxWidthStyle.set(`${width}%`);
      flexStyle.set(`0 0 ${width}%`);
    });
  const updateStyle = (state: TypeObject<boolean>): void => {
    matchesForEach(state, (bp, match) => {
      const alias = `span.${bp}`;
      const input = numberAttribute(this[convertClassName(alias) as 'spanXs']);

      if (match && input) {
        activeSpan.set(input);
        console.log(bp);
      }
    });

    if (activeSpan() !== null) {
    } else if (nxSpan() === undefined) {
      hostDom.removeStyle('maxWidth');
      hostDom.removeStyle('flex');
    } else {
      const span = nxSpan() as number;
      const width = toFixed5((span / columns()) * 100);
      const maxWidth = `${width}%`;
      const flex = `0 0 ${maxWidth}`;
      const cssText = getHostStyle('cssText');

      console.log(cssText);
      if (!cssText.includes(`flex: ${flex}`)) {
        flexStyle.set(flex);
      }

      if (!cssText.includes(`max-width: ${maxWidth}`)) {
        maxWidthStyle.set(maxWidth);
      }
    }
  };

  // 初始
  updateStyle(mediaMatchers());

  const resize = useResize();
  resize.pipe(throttleTime(1000)).subscribe(() => updateStyle(mediaMatchers()));

  onChanges.call(this, changes => {
    Object.keys(changes).forEach(key => {
      if (!key.concat('span') && !(key.length <= 'span'.length)) {
        return;
      }
      const matchers = mediaMatchers();

      updateStyle(matchers);
    });
  });
}
