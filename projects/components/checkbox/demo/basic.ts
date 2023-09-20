import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxCheckboxModule } from 'ng-yk-design/checkbox';
import { NxSpaceComponent } from 'ng-yk-design/space';

@Component({
  selector: 'app-demo-checkbox-basic',
  standalone: true,
  imports: [CommonModule, ...NxCheckboxModule, NxSpaceComponent],
  template: `
    <nx-space>
      <nx-checkbox [checked]="true">checked</nx-checkbox>
      <nx-checkbox [indeterminate]="true">indeterminate</nx-checkbox>
      <nx-checkbox [disabled]="true">disabled</nx-checkbox>
      <nx-checkbox [disabled]="true" [checked]="true">disabled</nx-checkbox>
    </nx-space>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent {}
