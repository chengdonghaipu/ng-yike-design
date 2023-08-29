import { Routes } from '@angular/router';
import { IntroducesComponent } from "./introduces.component";

export const routes: Routes = [
  {
    path: '',
    component: IntroducesComponent,
    children: [

    ]
  }
];
