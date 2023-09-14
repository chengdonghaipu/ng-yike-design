import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxFlexLayoutModule } from 'ng-yk-design/grid';
import { NxSpaceComponent } from 'ng-yk-design/space';

@Component({
  selector: 'app-demo-space-size',
  standalone: true,
  imports: [CommonModule, NxSpaceComponent, ...NxFlexLayoutModule],
  template: `
    <nx-row>
      <nx-col nxSpan="24">
        <h2>nxSize="small"</h2>
        <nx-space nxSize="small">
          <div></div>
          <div></div>
          <div></div>
        </nx-space>
      </nx-col>
      <nx-col nxSpan="24">
        <h2>nxSize="medium"</h2>
        <nx-space nxSize="medium">
          <div></div>
          <div></div>
          <div></div>
        </nx-space>
      </nx-col>
      <nx-col nxSpan="24">
        <h2>nxSize="large"</h2>
        <nx-space nxSize="large">
          <div></div>
          <div></div>
          <div></div>
        </nx-space>
      </nx-col>
      <nx-col nxSpan="24">
        <h2>nxSize="xLarge"</h2>
        <nx-space nxSize="xLarge">
          <div></div>
          <div></div>
          <div></div>
        </nx-space>
      </nx-col>
      <nx-col nxSpan="24">
        <h2>nxSize="50px" 自定义</h2>
        <nx-space nxSize="50px">
          <div></div>
          <div></div>
          <div></div>
        </nx-space>
      </nx-col>
      <nx-col nxSpan="24">
        <h2>nxSize="50px 20px" 自定义 换行</h2>
        <nx-space nxSize="50px 20px" wrap>
          <div class="large"></div>
          <div class="large"></div>
          <div class="large"></div>
          <div class="large"></div>
          <div class="large"></div>
          <div class="large"></div>
          <div class="large"></div>
          <div class="large"></div>
          <div class="large"></div>
          <div class="large"></div>
          <div class="large"></div>
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

        &.large {
          height: 90px;
          width: 90px;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SizeComponent {}
