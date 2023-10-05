import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { GET, NxHttpDirective, useHttpContext } from 'ng-yk-design/http';
import { NxInputModule } from 'ng-yk-design/input';
import { NxSpaceComponent } from 'ng-yk-design/space';

@Injectable({ providedIn: 'root' })
class HttpTestService {
  constructor() {}
  @GET.Event('user')
  getUser(): Observable<{ a: '' }> {
    const ctx = useHttpContext<{ a: '' }, 'response', 'json'>();
    console.log(ctx);
    return of({ a: '' });
  }
}

@Component({
  selector: 'app-demo-http-basic',
  standalone: true,
  imports: [CommonModule, ...NxInputModule, NxSpaceComponent, FormsModule, NxHttpDirective],
  template: `
    <nx-space nxDirection="vertical" nx-space="12">
      <nx-space nxDirection="vertical"> </nx-space>
      <p>状态</p>
      <nx-space nxDirection="vertical"> </nx-space>
    </nx-space>
    <div *ngFor="let item of [1]"></div>
    <div *nxHttp="let data; in: http.getUser; let loading = loading"
      >11{{ data.a }}
      <!--      {{ data }}-->
    </div>
    <ng-container></ng-container>
  `,
  styles: [
    `
      input,
      textarea {
        width: 100%;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent {
  http = inject(HttpTestService);

  constructor() {
    this.http.getUser().subscribe(value => {
      console.log(value);
    });
  }
}
