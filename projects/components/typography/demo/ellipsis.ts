import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NxTypographyModule } from 'ng-yk-design/typography';

@Component({
  selector: 'app-demo-typography-ellipsis',
  standalone: true,
  imports: [CommonModule, NxTypographyModule],
  template: `
    <h4 nx-title>逸刻时光</h4>
    <nx-paragraph type="secondary">
      出于对前端组件的好奇，利用业余时间将设计的一个应用提炼出部分设计规范，从而创建出此套对应的前端组件。期望人人都能直面源码，更佳灵活的使用在型项目中。
    </nx-paragraph>
    <h4 nx-title>Yike Design</h4>
    <nx-paragraph>
      QQ群：740076696 欢迎加入交流；本人QQ：1334785356 加我请注明 “yike Design”。微信群不好分享，可加本人微信：
      <nx-text type="primary">yikeyikech</nx-text>
      加我请注明 “yike Design” 之后将邀请进入相关群内，谢谢。
    </nx-paragraph>
    <nx-paragraph>
      本组件库倾尽我多半的业余生活，也经历了一个个深夜的探索。若能得到您的肯定，这一切都是值得的！
    </nx-paragraph>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EllipsisComponent {}
