/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import {
  HttpClient,
  HttpContext,
  HttpEvent,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';

import { SafaAny, TypeObject } from 'ng-yk-design/core';

export type PathParams = TypeObject<string | number>;
export type QueryParams = TypeObject<string | number | boolean | ReadonlyArray<string | number | boolean>>;

class RequestParams {
  queryParams: QueryParams = {};
  pathParams: PathParams = {};
  body: SafaAny | null = null;
}

class HttpResponseContext<U = never, T = 'response', R = 'json'> {
  request = new RequestParams();
  readonly response!: T extends 'body'
    ? R extends 'text'
      ? U extends never
        ? string
        : U
      : R extends 'json'
      ? U extends never
        ? Object
        : U
      : R extends 'blob'
      ? U extends never
        ? Blob
        : U
      : R extends 'arraybuffer'
      ? U extends never
        ? ArrayBuffer
        : U
      : never
    : T extends 'events'
    ? R extends 'text'
      ? U extends never
        ? HttpEvent<string>
        : HttpEvent<U>
      : R extends 'json'
      ? U extends never
        ? HttpEvent<Object>
        : HttpEvent<U>
      : R extends 'blob'
      ? U extends never
        ? HttpEvent<Blob>
        : HttpEvent<U>
      : R extends 'arraybuffer'
      ? U extends never
        ? HttpEvent<ArrayBuffer>
        : HttpEvent<U>
      : never
    : T extends 'response'
    ? R extends 'text'
      ? U extends never
        ? HttpResponse<string>
        : HttpResponse<U>
      : R extends 'json'
      ? U extends never
        ? HttpResponse<Object>
        : HttpResponse<U>
      : R extends 'blob'
      ? U extends never
        ? HttpResponse<Blob>
        : HttpResponse<U>
      : R extends 'arraybuffer'
      ? U extends never
        ? HttpResponse<ArrayBuffer>
        : HttpResponse<U>
      : never
    : never;

  constructor(response: HttpResponse<SafaAny> | HttpEvent<SafaAny>) {
    this.response = response as SafaAny;
  }
}

let _context: HttpResponseContext<SafaAny, SafaAny, SafaAny>;

export function useHttpContext<
  U = never,
  T extends 'events' | 'response' = 'response',
  R extends 'text' | 'json' | 'blob' | 'arraybuffer' = 'json'
>(): HttpResponseContext<U, T, R> {
  return _context;
}

interface HttpClientOptions {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  context?: HttpContext;
  params?:
    | HttpParams
    | {
        [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
      };
  observe?: 'response' | 'events';
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
}

interface HttpOptions extends HttpClientOptions {
  url: string;
  body?: SafaAny;
}

function httpRequest<T, This, Args extends never[]>(decorate: string, config: HttpOptions) {
  return function (
    target: (this: This, ...args: Args) => Observable<T> | Promise<T>,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Observable<T>>
  ): (this: This, ...args: Args) => Observable<T> {
    const methodName = String(context.name);

    if (context.private) {
      throw new Error(`'${decorate}' cannot decorate private properties like ${methodName as string}.`);
    }

    let http: HttpClient;

    context.addInitializer(function () {
      http = inject(HttpClient);
      // @ts-ignore
      this[methodName] = this[methodName].bind(this);
    });

    if (!config.headers || !(config.headers instanceof HttpHeaders)) {
      config.headers = new HttpHeaders(config.headers || {});
    }

    if (!config.params || !(config.params instanceof HttpParams)) {
      config.params = new HttpParams({ fromObject: config.params || {} });
    }

    config.observe = config.observe ?? 'response';
    config.responseType = config.responseType ?? 'json';

    const observe = config.observe;
    const method = decorate;

    function newMethod(this: This, ...args: Args): Observable<T> {
      if (observe === 'response') {
        return http.request(method, config.url, config).pipe(
          switchMap(value => {
            _context = new HttpResponseContext(value);
            return target.call(this, ...args);
          })
        );
      }

      const req = new HttpRequest(method, config.url, config);

      return http.request(req).pipe(
        switchMap(value => {
          _context = new HttpResponseContext(value);
          return target.call(this, ...args);
        })
      ) as Observable<T>;
    }

    return newMethod;
  };
}

interface GetOptions extends HttpClientOptions {}
interface PostOptions extends HttpClientOptions {
  body?: SafaAny;
}

interface Target<T, This, Args extends never[]> {
  (
    target: (this: This, ...args: Args) => Observable<T> | Promise<T>,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Observable<T>>
  ): (this: This, ...args: Args) => Observable<T>;
}

function createRequestDecorateFromFunction<F extends Function, U extends Record<string, unknown>>(
  fn: F,
  extraApi: U
): F & U {
  return Object.assign(fn, extraApi);
}

export const PUT = createRequestDecorateFromFunction(
  function (url: string, config?: PostOptions): Target<SafaAny, SafaAny, SafaAny> {
    config = config ?? {};

    return httpRequest('PUT', { ...config, url });
  },
  {
    Event: function (url: string, config?: PostOptions): Target<SafaAny, SafaAny, SafaAny> {
      config = config ?? {};

      return httpRequest('PUT', { ...config, url, observe: 'events' });
    }
  }
);

export const GET = createRequestDecorateFromFunction(
  function (url: string, config?: GetOptions): Target<SafaAny, SafaAny, SafaAny> {
    config = config ?? {};

    return httpRequest('GET', { ...config, url });
  },
  {
    Event: function (url: string, config?: GetOptions): Target<SafaAny, SafaAny, SafaAny> {
      config = config ?? {};

      return httpRequest('GET', { ...config, url, observe: 'events' });
    }
  }
);

export const POST = createRequestDecorateFromFunction(
  function (url: string, config?: PostOptions): Target<SafaAny, SafaAny, SafaAny> {
    config = config ?? {};
    return httpRequest('POST', { ...config, url });
  },
  {
    Event: function (url: string, config?: PostOptions): Target<SafaAny, SafaAny, SafaAny> {
      config = config ?? {};

      return httpRequest('POST', { ...config, url, observe: 'events' });
    }
  }
);
