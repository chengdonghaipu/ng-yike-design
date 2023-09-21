import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NxInputModule } from 'ng-yk-design/input';
import { NxSpaceComponent } from 'ng-yk-design/space';

@Component({
  selector: 'app-demo-input-basic',
  standalone: true,
  imports: [CommonModule, ...NxInputModule, NxSpaceComponent, FormsModule],
  template: `
    <nx-space nxDirection="vertical">
      <nx-space nxDirection="vertical">
        <input type="text" nx-input size="small" [(ngModel)]="model1" />
        <input type="text" size="medium" nx-input [(ngModel)]="model1" />
        <input type="text" nx-input [(ngModel)]="model1" />
        <input type="text" size="xLarge" nx-input [(ngModel)]="model1" />
        <p>{{ model1 }}</p>
      </nx-space>
      <p>状态</p>
      <nx-space nxDirection="vertical">
        <input type="text" nx-input status="default" placeholder="默认" />
        <input type="text" nx-input status="danger" placeholder="危险" />
        <input type="text" nx-input status="success" placeholder="cg" />
        <input type="text" nx-input status="warning" placeholder="警告" />
        <input type="text" nx-input [disabled]="true" [(ngModel)]="disabled" />
        <input type="text" nx-input [readonly]="true" [(ngModel)]="readonly" />
      </nx-space>
    </nx-space>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent {
  model1 = '你好， Yike Design';
  disabled = '禁用 Yike Design';
  readonly = '只读 Yike Design';
}
