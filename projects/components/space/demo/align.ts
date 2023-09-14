import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxFlexLayoutModule } from 'ng-yk-design/grid';
import { NxSpaceComponent } from 'ng-yk-design/space';

@Component({
  selector: 'app-demo-space-align',
  standalone: true,
  imports: [CommonModule, NxSpaceComponent, ...NxFlexLayoutModule],
  template: `
    <nx-row>
      <nx-col nxSpan="24">
        <h2>默认上对齐</h2>
        <nx-space>
          <div></div>
          <div class="size1"></div>
          <div class="size2"></div>
        </nx-space>
      </nx-col>
      <nx-col nxSpan="24">
        <h2>上对齐</h2>
        <nx-space nxAlign="start">
          <div></div>
          <div class="size1"></div>
          <div class="size2"></div>
        </nx-space>
      </nx-col>
      <nx-col nxSpan="24">
        <h2>中间对齐</h2>
        <nx-space nxAlign="center">
          <div></div>
          <div class="size1"></div>
          <div class="size2"></div>
        </nx-space>
      </nx-col>
      <nx-col nxSpan="24">
        <h2>下对齐</h2>
        <nx-space nxAlign="end">
          <div></div>
          <div class="size1"></div>
          <div class="size2"></div>
        </nx-space>
      </nx-col>
    </nx-row>
  `,
  styles: [
    `
      nx-space div {
        background-color: var(--yk-color-primary);
        width: 50px;
        height: 50px;

        &.size1 {
          height: 60px;
          width: 60px;
        }

        &.size2 {
          height: 90px;
          width: 90px;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlignComponent {}
