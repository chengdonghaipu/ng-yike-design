import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxIconModule } from 'ng-yk-design/icon';

@Component({
  selector: 'app-demo-icon-basic',
  standalone: true,
  imports: [CommonModule, ...NxIconModule],
  template: `
    <span nx-icon></span>
    <nx-icon></nx-icon>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent {}
