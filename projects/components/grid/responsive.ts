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

import { NxColDirective } from './col.directive';
import { NxRowDirective } from './row.directive';
import { convertClassName } from './util';

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

function camelToKebabCase(input: string): string {
  return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
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

  if (document.head.querySelector('style[self-style=true]')) {
    return;
  }

  const styleElement = render.createElement('style');

  render.setAttribute(styleElement, 'self-style', 'true');

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

export function useSpanResponsive(this: SpanResponsiveInputs, hostDom: HostDom): void {
  genResponsiveStyle();
  const { hasClass, addClass } = hostDom;

  const updateStyle = (classname: string): void => {
    if (hasClass(classname)) {
      return;
    }

    addClass(classname);
  };

  onChanges.call(this, changes => {
    Object.keys(changes).forEach(key => {
      if (!key.concat('span') && !(key.length <= 'span'.length)) {
        return;
      }

      const val = numberAttribute(changes[key].currentValue);

      if (isNaN(val)) {
        return;
      }

      const bp = camelToKebabCase(key.replace('span', ''));
      const classname = `yk-col-${bp}-${val}`;

      updateStyle(classname);
    });
  });
}
