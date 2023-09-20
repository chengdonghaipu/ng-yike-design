import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxAnchorModule } from 'ng-yk-design/anchor';

@Component({
  selector: 'app-demo-anchor-basic',
  standalone: true,
  imports: [CommonModule, ...NxAnchorModule],
  template: ``,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent {}
