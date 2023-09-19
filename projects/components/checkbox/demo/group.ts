import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NxCheckboxModule } from 'ng-yk-design/checkbox';
import { NxSpaceComponent } from 'ng-yk-design/space';

@Component({
  selector: 'app-demo-checkbox-group',
  standalone: true,
  imports: [CommonModule, ...NxCheckboxModule, NxSpaceComponent, FormsModule],
  template: `
    <nx-space>
      <nx-checkbox [indeterminate]="group.indeterminate()" [checked]="group.allChecked()">全选</nx-checkbox>
    </nx-space>
    <br />
    <nx-checkbox-group #group>
      <nx-checkbox [checked]="true">checked</nx-checkbox>
      <nx-checkbox [checked]="true">checked</nx-checkbox>
      <nx-checkbox [checked]="true">checked</nx-checkbox>
    </nx-checkbox-group>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupComponent {}
