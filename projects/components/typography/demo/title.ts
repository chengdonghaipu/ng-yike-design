import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxTypographyModule } from 'ng-yk-design/typography';

@Component({
  selector: 'app-demo-typography-title',
  standalone: true,
  imports: [CommonModule, NxTypographyModule],
  template: `
    <h1 nx-title>H1 欢迎使用 Yike Design</h1>
    <h2 nx-title>H2 欢迎使用 Yike Design</h2>
    <h3 nx-title>H3 欢迎使用 Yike Design</h3>
    <h4 nx-title>H4 欢迎使用 Yike Design</h4>
    <h5 nx-title>H5 欢迎使用 Yike Design</h5>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleComponent {}
