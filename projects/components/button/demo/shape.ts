import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxButtonModule } from 'ng-yk-design/button';

@Component({
  selector: 'app-demo-button-shape',
  standalone: true,
  imports: [CommonModule, ...NxButtonModule],
  template: `
    <button nx-button>default</button>
    <button nx-button nxShape="circle">circle</button>
    <button nx-button nxShape="round">round</button>
    <button nx-button nxShape="square">square</button>
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
export class ShapeComponent {}
