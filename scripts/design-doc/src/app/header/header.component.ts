import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {NxFlexLayoutModule} from "ng-yk-design/grid";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ...NxFlexLayoutModule],
  template: `
    <header nxRow nowrap nxJustify="between" nxAlign="center">
      <div nxCol nxRow nxJustify="center" class="logo">
        <img alt="" src="assets/logo.svg"/>
        <span class="name">Yike Design</span>
      </div>
      <div nxCol nxRow nxAlign="center" [nxGutter]="[0, 20]" class="nav-list">
        <a nxCol routerLink="/docs" routerLinkActive="router-active">文档</a>
        <a nxCol routerLink="/components" routerLinkActive="router-active">组件</a>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host header {
      height: 60px;
      width: 100%;
      background-color: #fff;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      padding: 0 30px;
      border-bottom: 1px solid #E8E8E8;
      transition: all .3s;

      .nav-list {
        a {
          color: #1e2025;
          text-decoration: none;
          min-width: 24px;
          line-height: 60px;
          transition: all .3s ease-in-out;

          &.router-active {
            color: #1890ff;
          }

          &:hover {
            color: #1890ff;
          }
        }
      }
    }

    :host .logo img {
      margin-right: 8px;
    }

    :host .logo {
      cursor: pointer;
      font-weight: 400;
    }
  `]
})
export class HeaderComponent {

}
