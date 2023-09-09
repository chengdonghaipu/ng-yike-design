/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { inject, Injectable, NgZone, Renderer2, RendererFactory2 } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { auditTime, finalize, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResizeService {
  private readonly resizeSource$ = new Subject<Event>();
  private readonly renderer: Renderer2;
  private listeners = 0;
  private disposeHandle?: () => void;

  private handler = (event: Event): void => {
    this.ngZone.run(() => {
      this.resizeSource$.next(event);
    });
  };

  constructor(private ngZone: NgZone, private rendererFactory2: RendererFactory2) {
    this.renderer = this.rendererFactory2.createRenderer(null, null);
  }

  private registerListener(): void {
    if (this.listeners === 0) {
      this.ngZone.runOutsideAngular(() => {
        this.disposeHandle = this.renderer.listen('window', 'resize', this.handler);
      });
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
  subscribe(): Observable<Event> {
    this.registerListener();

    return this.resizeSource$.pipe(
      auditTime(16),
      finalize(() => this.unregisterListener())
    );
  }
}

export function useResize(): Observable<Event> {
  const resizeService = inject(ResizeService);

  return resizeService.subscribe().pipe(takeUntilDestroyed());
}
