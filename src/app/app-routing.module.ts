import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { AboutComponent } from './components/about/about.component';
import { HomeComponent } from './components/home/home.component';

import { GlobalAuthGuard, IntervAuthGuard } from './providers/auth.guard'

const routes: Routes = [
  { path: 'home',   component: HomeComponent, canActivate: [GlobalAuthGuard] },
  { path: 'login',  component: LoginComponent },
  { path: 'about',  component: AboutComponent },
  { path: 'resources',
    loadChildren: () => import('./modules/resources/resources.module').then(m => m.ResourcesModule),
    canActivate: [IntervAuthGuard],
  },
  { path: '**', redirectTo: '/home' },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
