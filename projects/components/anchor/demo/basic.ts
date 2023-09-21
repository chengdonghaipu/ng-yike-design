import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxAnchorModule } from 'ng-yk-design/anchor';

@Component({
  selector: 'app-demo-anchor-basic',
  standalone: true,
  imports: [CommonModule, ...NxAnchorModule],
  template: `
    <nx-anchor [container]="container">
      <nx-anchor-link href="#section1" title="何时使用"></nx-anchor-link>
      <nx-anchor-link href="#section2" title="API">
        <nx-anchor-link href="#section3" title="api1"></nx-anchor-link>
        <nx-anchor-link href="#section4" title="api2"></nx-anchor-link>
      </nx-anchor-link>
    </nx-anchor>
    <div #container class="container">
      <div>
        <section id="section1" class="section">
          <p class="p">人间有此白玉京</p>
        </section>
        <section id="section2" class="section">
          <p class="p">人生得意须尽欢</p>
        </section>
        <section id="section3" class="section">
          <p class="p">人间四月芳菲尽</p>
        </section>
        <section id="section4" class="section">
          <p class="p">人间四月芳菲尽</p>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        overflow-y: auto;
        width: 200px;
        height: 100px;
        scroll-behavior: smooth;

        .section {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 150px;
          background-color: #dd524c;

          .p {
            font-size: 20px;
            font-weight: 500;
          }

          &:nth-child(2) {
            height: 200px;
            background-color: #e87b35;
          }

          &:nth-child(3) {
            height: 300px;
            background-color: #94ca42;
          }
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent {}
