import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="main-view">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      height: 100%;
      flex-direction: column;
      flex-wrap: nowrap;
    }

    :host app-header {
      display: block;
      height: 56px;
    }

    :host .main-view {
      flex: 1;
      overflow: hidden;
    }
  `],
})
export class AppComponent {
  title = 'design-doc';
}
