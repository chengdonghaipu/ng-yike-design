import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxButtonModule } from 'ng-yk-design/button';

@Component({
  selector: 'app-demo-button-basic',
  standalone: true,
  imports: [CommonModule, ...NxButtonModule],
  template: `
    <button nx-button nxType="primary">primary</button>
    <button nx-button nxType="secondary">secondary</button>
    <button nx-button nxType="outline">outline</button>
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
export class BasicComponent {}
