import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NxCheckboxModule } from 'ng-yk-design/checkbox';
import { NxFlexLayoutModule, NxRowDirective } from 'ng-yk-design/grid';
import { NxSpaceComponent } from 'ng-yk-design/space';

@Component({
  selector: 'app-demo-checkbox-group',
  standalone: true,
  imports: [CommonModule, ...NxCheckboxModule, NxSpaceComponent, FormsModule, ...NxFlexLayoutModule],
  template: `
    <nx-row>
      <nx-col nxSpan="24">
        <h2>非表单中使用</h2>
        <nx-space>
          <nx-checkbox #checkbox>全选</nx-checkbox>
        </nx-space>
        <br />
        <nx-checkbox-group [checkbox]="checkbox">
          <nx-checkbox [checked]="true">option1</nx-checkbox>
          <nx-checkbox [checked]="true">option2</nx-checkbox>
          <nx-checkbox [checked]="true">option3</nx-checkbox>
        </nx-checkbox-group>
      </nx-col>
    </nx-row>
    <nx-row>
      <nx-col nxSpan="24">
        <h2>表单中使用(内容投影 自定义布局)</h2>
        <nx-space>
          <nx-checkbox #checkbox1>全选</nx-checkbox>
        </nx-space>
        <br />
        <nx-checkbox-group [checkbox]="checkbox1" [(ngModel)]="groupValue">
          <nx-checkbox value="option1">option1</nx-checkbox>
          <nx-checkbox value="option2">option2</nx-checkbox>
          <nx-checkbox value="option3">option3</nx-checkbox>
        </nx-checkbox-group>
        <br />
        {{ groupValue | json }}
      </nx-col>
    </nx-row>
    <nx-row>
      <nx-col nxSpan="24">
        <h2>表单中使用(通过输入属性渲染子checkbox)</h2>
        <nx-space>
          <nx-checkbox #checkbox2>全选</nx-checkbox>
        </nx-space>
        <br />
        <nx-checkbox-group [checkbox]="checkbox2" [(ngModel)]="groupValue1" [checkboxOptions]="checkboxOptions">
        </nx-checkbox-group>
        <br />
        {{ groupValue1 | json }}
      </nx-col>
    </nx-row>
    <nx-row>
      <nx-col nxSpan="24">
        <h2>表单中使用-混合模式(内容投影 + 通过输入属性渲染子checkbox)</h2>
        <nx-space>
          <nx-checkbox #checkbox3>全选</nx-checkbox>
        </nx-space>
        <br />
        <nx-checkbox-group [checkbox]="checkbox3" [(ngModel)]="groupValue2" [checkboxOptions]="checkboxOptions">
          <nx-checkbox value="option4">option4</nx-checkbox>
          <nx-checkbox value="option5">option5</nx-checkbox>
          <nx-checkbox value="option6">option6</nx-checkbox>
        </nx-checkbox-group>
        <br />
        {{ groupValue2 | json }}
      </nx-col>
    </nx-row>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupComponent {
  groupValue: string[] = ['option1'];
  groupValue1: string[] = ['option1'];
  groupValue2: string[] = ['option1'];
  checkboxOptions = [
    { checked: true, value: 'option1', label: 'option1' },
    { checked: false, value: 'option2', label: 'option2' },
    { checked: false, value: 'option3', label: 'option3' }
  ];
}
