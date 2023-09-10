/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { J } from '@angular/cdk/keycodes';
import { BreakpointObserver, BreakpointState, MediaMatcher } from '@angular/cdk/layout';
import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  auditTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  Observable,
  of,
  startWith,
  Subject,
  throttleTime
} from 'rxjs';

import { TypeObject } from 'ng-yk-design/core';

export const gridResponsiveMap = {
  xs: '(max-width: 575px)',
  ['gt-xs']: '(min-width: 576px)',
  ['lt-sm']: '(max-width: 575.99px)',
  sm: '(min-width: 576px) and (max-width: 767.99px)',
  ['gt-sm']: '(min-width: 768px)',
  ['lt-md']: '(max-width: 767.99px)',
  md: '(min-width: 768px) and (max-width: 991.99px)',
  ['gt-md']: '(min-width: 992px)',
  ['lt-lg']: '(max-width: 991.99px)',
  lg: '(min-width: 992px) and (max-width: 1199.99px)',
  ['gt-lg']: '(min-width: 1200px)',
  ['lt-xl']: '(max-width: 1199.99px)',
  xl: '(min-width: 1200px) and (max-width: 1599.99px)',
  ['gt-xl']: '(min-width: 1600px)',
  ['lt-xxl']: '(max-width: 1599.99px)',
  xxl: '(min-width: 1600px)'
};

const translate: TypeObject<string> = Object.entries(gridResponsiveMap).reduce(
  (previousValue, currentValue) => Object.assign(previousValue, { [currentValue[1]]: currentValue[0] }),
  {}
);

@Injectable({
  providedIn: 'root'
})
export class BreakpointService {
  private readonly breakpoints = [
    gridResponsiveMap.xs,
    gridResponsiveMap.sm,
    gridResponsiveMap.md,
    gridResponsiveMap.lg,
    gridResponsiveMap.xl,
    gridResponsiveMap.xxl,
    gridResponsiveMap['gt-lg'],
    gridResponsiveMap['gt-md'],
    gridResponsiveMap['gt-sm'],
    gridResponsiveMap['gt-xl'],
    gridResponsiveMap['lt-lg'],
    gridResponsiveMap['lt-md'],
    gridResponsiveMap['lt-sm'],
    gridResponsiveMap['lt-xl'],
    gridResponsiveMap['lt-xxl'],
    gridResponsiveMap['gt-xs']
  ];
  private readonly change$ = new Subject<BreakpointState>();
  private listeners = 0;
  private disposeHandle?: () => void;

  constructor(private readonly observer: BreakpointObserver, private readonly mediaMatcher: MediaMatcher) {}

  mediaMatchers(): TypeObject<boolean> {
    return this.breakpoints.reduce(
      (previousValue, currentValue) =>
        Object.assign(previousValue, {
          [currentValue]: this.mediaMatcher.matchMedia(currentValue).matches
        }),
      {}
    ) as TypeObject<boolean>;
  }

  private registerListener(): void {
    if (this.listeners === 0) {
      this.observer
        .observe(this.breakpoints)
        // .pipe(filter(value => value.matches))
        .subscribe(value => this.change$.next(value));
    }
    this.listeners += 1;
  }
  private unregisterListener(): void {
    this.listeners -= 1;

    if (this.listeners === 0) {
      this.disposeHandle?.();
      this.disposeHandle = undefined;
    }
  }
  subscribe(): Observable<BreakpointState> {
    this.registerListener();

    return this.change$.pipe(finalize(() => this.unregisterListener()));
  }
}

export interface UseBreakpointReturn {
  readonly translate: TypeObject<string>;

  readonly observer: Observable<TypeObject<boolean>>;

  matchesForEach(state: TypeObject<boolean>, callback: (breakpoint: string, match: boolean) => void): void;

  mediaMatchers(): TypeObject<boolean>;
}

export function useBreakpoint(): UseBreakpointReturn {
  const observer = inject(BreakpointService);

  function matchesForEach(state: TypeObject<boolean>, callback: (breakpoint: string, match: boolean) => void): void {
    for (const [key, value] of Object.entries(state)) {
      callback(translate[key], value);
    }
  }

  // observer.subscribe().subscribe(value => {
  //   console.log(value);
  // });

  return {
    translate,
    observer: observer.subscribe().pipe(
      startWith({ matches: true, breakpoints: observer.mediaMatchers() } as BreakpointState),
      filter(value => value.matches),
      map(value => value.breakpoints),
      takeUntilDestroyed()
    ),
    matchesForEach,
    mediaMatchers: observer.mediaMatchers.bind(observer)
  };
}
