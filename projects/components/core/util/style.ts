/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

export function getCssVar(namespace: string, props: string[]): string {
  return `var(--yk-${namespace}-${props.join('-')})`;
}
