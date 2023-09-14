import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxSpaceComponent } from 'ng-yk-design/space';

@Component({
  selector: 'app-demo-space-basic',
  standalone: true,
  imports: [CommonModule, NxSpaceComponent],
  template: `
    <nx-space>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </nx-space>
  `,
  styles: [
    `
      nx-space div {
        background-color: var(--yk-color-primary);
        width: 50px;
        height: 50px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent {}
