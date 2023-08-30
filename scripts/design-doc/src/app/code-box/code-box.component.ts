import {Component, Input} from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-code-box',
  standalone: true,
  imports: [NgClass],
  template: `
    <section class="code-box" [ngClass]="{ expand: nxExpanded }" [attr.id]="nxId">
      <section class="code-box-demo">
        <div>
          <ng-content select="[demo]"></ng-content>
        </div>
      </section>
      <section class="code-box-meta markdown">
        <div class="code-box-title">
          <span> {{ nxTitle }} </span>
        </div>
        <div class="code-box-description">
          <ng-content select="[intro]"></ng-content>
        </div>
        <div class="code-box-actions">
          <span
            class="code-box-code-copy"
            [class.ant-tooltip-open]="copied"
            (click)="copyCode()"
          ></span>
          <span class="code-expand-icon" (click)="expandCode(!nxExpanded)">
            <img
              alt="expand code"
              src="https://gw.alipayobjects.com/zos/rmsportal/wSAkBuJFbdxsosKKpqyq.svg"
              [class.code-expand-icon-show]="nxExpanded"
              [class.code-expand-icon-hide]="!nxExpanded"
            />
            <img
              alt="expand code"
              src="https://gw.alipayobjects.com/zos/rmsportal/OpROPHYqWmrMDBFMZtKF.svg"
              [class.code-expand-icon-show]="!nxExpanded"
              [class.code-expand-icon-hide]="nxExpanded"
            />
          </span>
        </div>
      </section>
    </section>
  `,
  styles: [`
    .code-box-actions {
      display: flex;
      justify-content: center;
      padding: 12px 0;
      border-top: 1px dashed rgba(0,0,0,.06);
      opacity: .7;
      transition: opacity .3s;
    }
    .code-box {
      background-color: #fff;
      position: relative;
      display: inline-block;
      width: 100%;
      margin: 0 0 16px;
      border: 1px solid rgba(0,0,0,.06);
      border-radius: 2px;
      transition: all .2s;
    }
    .code-box-demo {
      padding: 42px 24px 50px;
      color: #000000d9;
      border-bottom: 1px solid rgba(0,0,0,.06);
      background-color: #fff;
    }
    .code-box .code-expand-icon-show {
      opacity: .55;
      pointer-events: auto;
    }

    .code-box .code-expand-icon-show, .code-box .code-expand-icon-hide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      max-width: 100%;
      margin: 0;
      box-shadow: none;
      transition: all .4s;
      -webkit-user-select: none;
      user-select: none;
    }
    .code-box .code-expand-icon {
      cursor: pointer;
    }
    .code-box-actions>form, .code-box-actions>span {
      position: relative;
      display: inline-block;
      width: 16px;
      height: 16px;
      margin-left: 16px;
      vertical-align: top;
    }

    img {
      vertical-align: middle;
      border-style: none;
    }

    .code-box-description {
      padding: 18px 24px 12px;
    }

    .code-box-title {
      position: absolute;
      top: -14px;
      margin-left: 16px;
      padding: 1px 8px;
      color: #000000d9;
      background: #fff;
      border-radius: 2px 2px 0 0;
      transition: background-color .4s;
    }

    .code-box-meta.markdown {
      position: relative;
      width: 100%;
      font-size: 14px;
      border-radius: 0 0 2px 2px;
      transition: background-color .4s;
    }
  `]
})
export class CodeBoxComponent {
  copied = false;
  @Input() nxId!: string;
  @Input() nxTitle!: string;
  @Input() nxExpanded = false;

  expandCode(expanded: boolean): void {
    this.nxExpanded = expanded;
    if (expanded) {
      // this.getDemoCode().subscribe();
    }
  }

  copyCode(): void {

  }
}
