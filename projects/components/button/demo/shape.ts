import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxButtonModule } from 'ng-yk-design/button';
import { NxIconModule } from 'ng-yk-design/icon';

@Component({
  selector: 'app-demo-button-shape',
  standalone: true,
  imports: [CommonModule, ...NxButtonModule, ...NxIconModule],
  template: `
    <button nx-button>default</button>
    <button nx-button nxShape="circle">
      <nx-icon icon="plus" type="outline"></nx-icon>
    </button>
    <button nx-button nxShape="round">round</button>
    <button nx-button nxShape="square">
      <nx-icon icon="plus" type="outline"></nx-icon>
    </button>
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
