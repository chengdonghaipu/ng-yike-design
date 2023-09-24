import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxTypographyModule } from 'ng-yk-design/typography';

@Component({
  selector: 'app-demo-typography-type',
  standalone: true,
  imports: [CommonModule, NxTypographyModule],
  template: `
    <h4 nx-title>标题不同类型展示</h4>
    <h4 nx-title type="secondary">标题不同类型展示</h4>
    <h4 nx-title type="primary">标题不同类型展示</h4>
    <h4 nx-title type="success">标题不同类型展示</h4>
    <h4 nx-title type="warning">标题不同类型展示</h4>
    <h4 nx-title type="danger">标题不同类型展示</h4>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeComponent {}
