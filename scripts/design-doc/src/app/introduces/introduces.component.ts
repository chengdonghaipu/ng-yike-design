import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-introduce',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="side">
      <ul>
        <li routerLink="/docs/introduce/zh" routerLinkActive="router-active"><a >introduce</a></li>
        <li routerLink="/docs/animations/zh" routerLinkActive="router-active"><a >animations</a></li>
      </ul>
    </div>
    <div class="doc-box">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./introduces.less']
})
export class IntroducesComponent {

}
