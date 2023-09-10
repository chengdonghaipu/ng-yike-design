/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

export type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

export type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type FlexFlow =
  | FlexDirection
  | 'nowrap'
  | 'wrap'
  | 'wrap-reverse'
  | 'row nowrap'
  | 'row wrap'
  | 'row wrap-reverse'
  | 'column nowrap'
  | 'column wrap'
  | 'column wrap-reverse';
