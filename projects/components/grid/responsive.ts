/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { DOCUMENT } from '@angular/common';
import { Directive, inject, Input, numberAttribute, Renderer2 } from '@angular/core';

import { HostDom, onChanges } from 'ng-yk-design/core';
import { gridResponsiveMap } from 'ng-yk-design/core/util';

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

export function useResponsive<T extends object>(
  this: T,
  hostDom: HostDom,
  input: string,
  genClassname?: (bp: string, span: number) => string
): void {
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
      if (!key.concat(input) && !(key.length <= input.length)) {
        return;
      }

      const val = numberAttribute(changes[key].currentValue);

      if (isNaN(val)) {
        return;
      }

      const bp = camelToKebabCase(key.replace(input, ''));
      const classname = genClassname?.(bp, val) || `yk-col-${bp}-${val}`;

      updateStyle(classname);
    });
  });
}

export function useSpanResponsive(this: SpanResponsiveInputs, hostDom: HostDom): void {
  useResponsive.call(this, hostDom, 'span');
}

@Directive()
export class PullResponsiveInputs {
  // @Input({ alias: 'nxSpan', transform: numberAttribute }) nxSpan!: number;
  @Input({ alias: 'pull.xs', transform: numberAttribute }) pullXs!: number;
  @Input({ alias: 'pull.sm', transform: numberAttribute }) pullSm!: number;
  @Input({ alias: 'pull.md', transform: numberAttribute }) pullMd!: number;
  @Input({ alias: 'pull.lg', transform: numberAttribute }) pullLg!: number;
  @Input({ alias: 'pull.xl', transform: numberAttribute }) pullXl!: number;
  @Input({ alias: 'pull.xxl', transform: numberAttribute }) pullXxl!: number;

  @Input({ alias: 'pull.gt-xs', transform: numberAttribute }) pullGtXs!: number;
  @Input({ alias: 'pull.lt-sm', transform: numberAttribute }) pullLtSm!: number;
  @Input({ alias: 'pull.gt-sm', transform: numberAttribute }) pullGtSm!: number;
  @Input({ alias: 'pull.lt-md', transform: numberAttribute }) pullLtMd!: number;
  @Input({ alias: 'pull.gt-md', transform: numberAttribute }) pullGtMd!: number;
  @Input({ alias: 'pull.lt-lg', transform: numberAttribute }) pullLtLg!: number;
  @Input({ alias: 'pull.gt-lg', transform: numberAttribute }) pullGtLg!: number;
  @Input({ alias: 'pull.lt-xl', transform: numberAttribute }) pullLtXl!: number;
  @Input({ alias: 'pull.gt-xl', transform: numberAttribute }) pullGtXl!: number;
  @Input({ alias: 'pull.lt-xxl', transform: numberAttribute }) pullLtXxl!: number;
}

export function usePullResponsive(this: PullResponsiveInputs, hostDom: HostDom): void {
  useResponsive.call(this, hostDom, 'pull', (bp, span) => `yk-col-${bp}-pull-${span}`);
}

@Directive()
export class OffsetResponsiveInputs {
  // @Input({ alias: 'nxSpan', transform: numberAttribute }) nxSpan!: number;
  @Input({ alias: 'offset.xs', transform: numberAttribute }) offsetXs!: number;
  @Input({ alias: 'offset.sm', transform: numberAttribute }) offsetSm!: number;
  @Input({ alias: 'offset.md', transform: numberAttribute }) offsetMd!: number;
  @Input({ alias: 'offset.lg', transform: numberAttribute }) offsetLg!: number;
  @Input({ alias: 'offset.xl', transform: numberAttribute }) offsetXl!: number;
  @Input({ alias: 'offset.xxl', transform: numberAttribute }) offsetXxl!: number;

  @Input({ alias: 'offset.gt-xs', transform: numberAttribute }) offsetGtXs!: number;
  @Input({ alias: 'offset.lt-sm', transform: numberAttribute }) offsetLtSm!: number;
  @Input({ alias: 'offset.gt-sm', transform: numberAttribute }) offsetGtSm!: number;
  @Input({ alias: 'offset.lt-md', transform: numberAttribute }) offsetLtMd!: number;
  @Input({ alias: 'offset.gt-md', transform: numberAttribute }) offsetGtMd!: number;
  @Input({ alias: 'offset.lt-lg', transform: numberAttribute }) offsetLtLg!: number;
  @Input({ alias: 'offset.gt-lg', transform: numberAttribute }) offsetGtLg!: number;
  @Input({ alias: 'offset.lt-xl', transform: numberAttribute }) offsetLtXl!: number;
  @Input({ alias: 'offset.gt-xl', transform: numberAttribute }) offsetGtXl!: number;
  @Input({ alias: 'offset.lt-xxl', transform: numberAttribute }) offsetLtXxl!: number;
}

export function useOffsetResponsive(this: OffsetResponsiveInputs, hostDom: HostDom): void {
  useResponsive.call(this, hostDom, 'offset', (bp, span) => `yk-col-${bp}-offset-${span}`);
}
