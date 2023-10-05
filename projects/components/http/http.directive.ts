/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable, of } from 'rxjs';

import { SafaAny } from 'ng-yk-design/core';

type WithoutObservable<T> = T extends Observable<infer U> ? U : T;
export class NxHttpInContext<T> {
  constructor(public $implicit: T, public loading: boolean) {}
}
function tt(): Observable<string> {
  return of('');
}
@Directive({
  selector: '[nxHttp][nxHttpIn]',
  standalone: true
})
export class NxHttpDirective<U extends (...args: SafaAny) => SafaAny> {
  loading = true;
  @Input()
  set nxHttpIn(ngForOf: U) {}

  constructor(
    private _viewContainer: ViewContainerRef,
    private _template: TemplateRef<NxHttpInContext<WithoutObservable<ReturnType<U>>>>
  ) {
    // const f: WithoutObservable<ReturnType<typeof tt>>
  }

  static ngTemplateContextGuard<U extends (...args: SafaAny) => SafaAny>(
    dir: NxHttpDirective<U>,
    ctx: any
  ): ctx is NxHttpInContext<WithoutObservable<ReturnType<U>>> {
    return true;
  }
}
