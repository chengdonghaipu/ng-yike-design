import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxButtonModule } from 'ng-yk-design/button';

@Component({
  selector: 'app-demo-button-disabled',
  standalone: true,
  imports: [CommonModule, ...NxButtonModule],
  template: `
    <button nx-button nxType="primary" disabled>primary</button>
    <button nx-button nxType="secondary" disabled>secondary</button>
    <button nx-button nxType="outline" disabled>outline</button>
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
export class DisabledComponent {}
