import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxButtonModule } from 'ng-yk-design/button';

@Component({
  selector: 'app-demo-button-size',
  standalone: true,
  imports: [CommonModule, ...NxButtonModule],
  template: `
    <button nx-button nxType="primary" nxSize="small">small</button>
    <button nx-button nxType="primary" nxSize="medium">medium</button>
    <button nx-button nxType="primary" nxSize="large">large</button>
    <button nx-button nxType="primary" nxSize="xLarge">xLarge</button>
  `,
  styles: [
    `
      button {
        margin-left: 16px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SizeComponent {}
