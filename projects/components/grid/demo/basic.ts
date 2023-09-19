import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxFlexLayoutModule } from 'ng-yk-design/grid';

@Component({
  selector: 'app-demo-grid-basic',
  standalone: true,
  imports: [CommonModule, ...NxFlexLayoutModule],
  template: `
    <nx-row nxAlign="center" [nxGutter]="[10, 20]">
      <nx-col [nxSpan]="3" nxHidden.xs>nxHidden.xs</nx-col>
      <nx-col [nxSpan]="4" nxHidden.lt-lg>4 nxHidden.lt-lg</nx-col>
      <nx-col [nxSpan]="4" nxHidden.lt-lg>4 nxHidden.lt-lg</nx-col>
      <nx-col nxRow [nxSpan]="4">
        <nx-col nxSpan="12">12</nx-col>
        <nx-col nxSpan="12">12</nx-col>
      </nx-col>
      <nx-col [nxSpan]="4" span.gt-lg="1">4</nx-col>
      <nx-col [nxSpan]="2" [nxPush]="3">2</nx-col>
    </nx-row>
  `,
  styles: [
    `
      :host nx-row > nx-col:nth-child(2n + 1) {
        background: rgba(0, 146, 255, 0.75);
      }
      :host nx-row > nx-col {
        background: #0092ff;
        color: #fff;
        text-align: center;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent {}
