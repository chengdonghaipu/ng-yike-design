import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxSpaceComponent } from 'ng-yk-design/space';
import { NxTypographyModule } from 'ng-yk-design/typography';

@Component({
  selector: 'app-demo-typography-text',
  standalone: true,
  imports: [CommonModule, NxTypographyModule, NxSpaceComponent],
  template: `
    <nx-space nxDirection="vertical">
      <span nx-text>Yike Design</span>
      <span nx-text type="secondary">secondary</span>
      <span nx-text type="primary">primary</span>
      <span nx-text type="warning">warning</span>
      <span nx-text type="danger">danger</span>
      <span nx-text type="success">success</span>
      <span nx-text disabled>disabled</span>
      <strong nx-text strong type="primary">Bold</strong>
      <span nx-text strong>strong</span>
      <span nx-text mark>mark</span>
      <span nx-text underline>underline</span>
      <span nx-text del>del</span>
    </nx-space>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextComponent {}
