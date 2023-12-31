/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { computed, ElementRef, inject, Renderer2, Signal } from '@angular/core';

import { SafaAny } from './type';
import { toHyphenCase } from './util';

export interface HostDom {
  readonly renderer: Renderer2;
  readonly elementRef: ElementRef<HTMLElement>;
  readonly element: Signal<HTMLElement>;

  setHostStyle<K extends keyof CSSStyleDeclaration>(style: K, value: SafaAny): void;

  setHostStyles(css: Partial<CSSStyleDeclaration>): void;

  removeStyle<K extends keyof CSSStyleDeclaration>(style: K): void;

  getHostStyle<K extends keyof CSSStyleDeclaration>(style: K): string;

  addClass(name: string): void;

  removeClass(name: string): void;

  removePrefixClass(prefix: string): void;

  removeSuffixClass(suffix: string): void;

  hasClass(name: string): boolean;
}

export function useHostDom(): HostDom {
  const renderer = inject(Renderer2);
  const elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  const element = computed(() => elementRef.nativeElement);

  function setHostStyle<K extends keyof CSSStyleDeclaration>(style: K, value: SafaAny): void {
    renderer.setStyle(element(), toHyphenCase(style as string), value);
  }

  function getHostStyle<K extends keyof CSSStyleDeclaration>(style: K): string {
    return (element()?.style[style] as string) ?? '';
  }

  function setHostStyles(css: Partial<CSSStyleDeclaration>): void {
    Object.entries(css).forEach(([style, value]) => setHostStyle(style as SafaAny, value));
  }

  function removeStyle<K extends keyof CSSStyleDeclaration>(style: K): void {
    renderer.removeStyle(element(), toHyphenCase(style as string));
  }

  function addClass(name: string): void {
    !hasClass(name) && renderer.addClass(element(), name);
  }

  function removeClass(name: string): void {
    renderer.removeClass(element(), name);
  }

  function removePrefixClass(prefix: string): void {
    element()?.classList.forEach(item => {
      if (!item.startsWith(prefix)) {
        return;
      }

      renderer.removeClass(element(), item);
    });
  }

  function removeSuffixClass(suffix: string): void {
    element()?.classList.forEach(item => {
      if (!item.endsWith(suffix)) {
        return;
      }

      renderer.removeClass(element(), item);
    });
  }

  function hasClass(name: string): boolean {
    return element()?.classList.contains(name);
  }

  return {
    setHostStyle,
    setHostStyles,
    removeStyle,
    getHostStyle,
    addClass,
    hasClass,
    removeClass,
    removePrefixClass,
    removeSuffixClass,
    renderer,
    elementRef,
    element
  };
}
