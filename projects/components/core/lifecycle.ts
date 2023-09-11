/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  DoCheck,
  OnChanges,
  OnDestroy,
  OnInit
} from '@angular/core';

import { SafaAny, TypeObject } from './types';

interface CycleOptions {
  enforce: 'pre' | 'post';
}

type LifeCycle = OnChanges &
  OnInit &
  OnDestroy &
  AfterViewInit &
  AfterContentInit &
  AfterContentChecked &
  AfterViewChecked &
  DoCheck;

const sourceCycleContainer = new WeakMap<Function, TypeObject<Function>>();
const container = new WeakMap<object, CycleManager<SafaAny>>();

function sourceCycle(cycleName: string, constructor: Function): Function | null {
  const sourceCycleObject = sourceCycleContainer.get(constructor) ?? {};

  const sourceCycle = sourceCycleObject[cycleName];

  if (sourceCycle) {
    return sourceCycle;
  }

  return null;
}

class CycleManager<T extends object> {
  private preContainer: SafaAny[] = [];
  private postContainer: SafaAny[] = [];
  constructor(private readonly context: T & Partial<LifeCycle>) {}

  private setSourceCycle(cycleName: string, sourceCycle: Function): void {
    const sourceCycleObject = sourceCycleContainer.get(this.context.constructor) ?? {};
    Object.assign(sourceCycleObject, { [cycleName]: sourceCycle });
    sourceCycleContainer.set(this.context.constructor, sourceCycleObject);
  }

  register(callback: Partial<LifeCycle>, options: CycleOptions): void {
    const cycles = Object.keys(callback) as Array<keyof typeof callback>;
    const cycle = cycles[0];

    if (!cycle) {
      return;
    }

    const callbacks = this.preContainer.concat(this.postContainer);

    const addCycle = (): void => {
      if (options.enforce === 'pre') {
        this.preContainer.push(callback[cycle]);
      } else {
        this.postContainer.push(callback[cycle]);
      }
    };

    if (callbacks.length) {
      // 已经注册
      addCycle();
      return;
    }

    addCycle();
    const cyKey = '__new_Cycle__';
    const oldCycle = this.context[cycle];

    if (oldCycle && !(oldCycle as SafaAny)[cyKey]) {
      this.setSourceCycle(cycle, oldCycle as Function);
    }

    if (this.context.constructor.prototype[cycle]) {
      return;
    }

    const temp = {
      [cycle]: function (...args: SafaAny[]): void {
        const that = container.get(this);
        const oldCycle = sourceCycle(cycle, this.constructor);

        if (!that) {
          if (oldCycle && !(oldCycle as SafaAny)[cyKey]) {
            // @ts-ignore
            oldCycle?.call(this, ...args);
          }
          return;
        }

        for (const preContainerElement of that.preContainer) {
          preContainerElement(...args);
        }

        try {
          if (oldCycle && !(oldCycle as SafaAny)[cyKey]) {
            // @ts-ignore
            oldCycle?.call(this, ...args);
          }
        } finally {
          for (const postContainerElement of that.postContainer) {
            postContainerElement(...args);
          }
        }
      }
    };
    // @ts-ignore
    temp[cycle][cyKey] = true;

    this.context.constructor.prototype[cycle] = temp[cycle];
  }
}

export function onChanges<T extends object>(
  this: T,
  callback: OnChanges['ngOnChanges'],
  options: CycleOptions = { enforce: 'post' }
): void {
  const cycleManager = container.get(this) ?? container.set(this, new CycleManager(this)).get(this);

  cycleManager?.register({ ngOnChanges: callback }, options);
  // console.log(container);
}

export function onInit<T extends object>(
  this: T,
  callback: OnInit['ngOnInit'],
  options: CycleOptions = { enforce: 'post' }
): void {
  const cycleManager = container.get(this) ?? container.set(this, new CycleManager(this)).get(this);

  cycleManager?.register({ ngOnInit: callback }, options);
}

export function doCheck<T extends object>(
  this: T,
  callback: DoCheck['ngDoCheck'],
  options: CycleOptions = { enforce: 'post' }
): void {
  const cycleManager = container.get(this) ?? container.set(this, new CycleManager(this)).get(this);

  cycleManager?.register({ ngDoCheck: callback }, options);
}

export function afterContentInit<T extends object>(
  this: T,
  callback: AfterContentInit['ngAfterContentInit'],
  options: CycleOptions = { enforce: 'post' }
): void {
  const cycleManager = container.get(this) ?? container.set(this, new CycleManager(this)).get(this);

  cycleManager?.register({ ngAfterContentInit: callback }, options);
}

export function afterContentChecked<T extends object>(
  this: T,
  callback: AfterContentChecked['ngAfterContentChecked'],
  options: CycleOptions = { enforce: 'post' }
): void {
  const cycleManager = container.get(this) ?? container.set(this, new CycleManager(this)).get(this);

  cycleManager?.register({ ngAfterContentChecked: callback }, options);
}

export function afterViewInit<T extends object>(
  this: T,
  callback: AfterViewInit['ngAfterViewInit'],
  options: CycleOptions = { enforce: 'post' }
): void {
  const cycleManager = container.get(this) ?? container.set(this, new CycleManager(this)).get(this);

  cycleManager?.register({ ngAfterViewInit: callback }, options);
}

export function afterViewChecked<T extends object>(
  this: T,
  callback: AfterViewChecked['ngAfterViewChecked'],
  options: CycleOptions = { enforce: 'post' }
): void {
  const cycleManager = container.get(this) ?? container.set(this, new CycleManager(this)).get(this);

  cycleManager?.register({ ngAfterViewChecked: callback }, options);
}
