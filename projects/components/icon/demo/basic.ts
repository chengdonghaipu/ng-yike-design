import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-demo-icon-basic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p> header works! </p>
    <p> header works! </p>
    <p> header works! </p>
    <p> header works! </p>
    <p> header works! </p>
    <p> header works! </p>
    <p> header works! </p>
    <p> header works! </p>
    <p [style.align-content]=""> header works! </p>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BasicComponent {}
