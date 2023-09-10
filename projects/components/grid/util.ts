/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/chengdonghaipu/ng-yike-design/blob/master/LICENSE
 */

export function convertClassName(className: string): string {
  const parts = className.split(/[.-]/);
  const result = parts
    .map((part, index) => {
      if (index === 0) {
        return part;
      } else {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
    })
    .join('');
  return result;
}
