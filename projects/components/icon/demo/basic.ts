import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxButtonModule } from 'ng-yk-design/button';
import { NxIconModule, PlusOutline, provideIcons, QuestionFill, QuestionOutline } from 'ng-yk-design/icon';

@Component({
  selector: 'app-demo-icon-basic',
  standalone: true,
  imports: [CommonModule, ...NxIconModule, ...NxButtonModule],
  template: `
    <span class="demo-icon" nx-icon icon="question" size="24px"></span>
    <nx-icon class="demo-icon" icon="question" type="outline" size="24px"></nx-icon>
    <nx-icon class="demo-icon" icon="app" type="fill" size="24px"></nx-icon>
    <button nx-button nxShape="circle">
      <nx-icon icon="plus" type="outline"></nx-icon>
    </button>
  `,
  styles: [
    `
      .demo-icon {
        margin-right: 6px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons([QuestionFill, QuestionOutline, PlusOutline])]
})
export class BasicComponent {}
