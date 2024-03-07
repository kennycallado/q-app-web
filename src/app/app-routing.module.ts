import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './components/about/about.component';
import { HomeComponent }  from './components/home/home.component';
import { JoinComponent }  from './components/join/join.component';
import { LoginComponent } from './components/login/login.component';

import { GlobalAuthGuard, IntervAuthGuard } from './providers/auth.guard'

const routes: Routes = [
  { path: 'home',  component: HomeComponent, canActivate: [GlobalAuthGuard] },
  { path: 'join',  component: JoinComponent, canActivate: [GlobalAuthGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
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
