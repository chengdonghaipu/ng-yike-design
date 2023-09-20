/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders, Provider } from '@angular/core';

import { NxIconDefinition } from './types';

export const STATIC_ICONS = new InjectionToken<NxIconDefinition[][]>('STATIC_ICONS');

export function provideIcons(icons: NxIconDefinition[]): Provider[] {
  return [{ provide: STATIC_ICONS, multi: true, useValue: icons }];
}

export function envProvideIcons(icons: NxIconDefinition[]): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: STATIC_ICONS, multi: true, useValue: icons }]);
}
