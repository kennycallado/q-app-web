import { Component, effect, inject } from '@angular/core';

import { IntervAuthService } from '../../providers/services/interventions/auth.service';
import { GlobalAuthService } from '../../providers/services/global/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass'
})
export class LoginComponent {
  #router = inject(Router)
  #interv_authSvc = inject(IntervAuthService)
  #global_authSvc = inject(GlobalAuthService)

  #update = effect(() => {
    if (this.#global_authSvc.ready() && this.#global_authSvc.authenticated()) this.#router.navigate(['/home'])
  })

  async global_login() {
    await this.#global_authSvc.login({ username: "kenny" })
  }

  async interv_login() {
    await this.#interv_authSvc.join({ ns: "interventions", db: "demo", sc: "user", pass: "01HJTEBG4Y1EAXPATENCDCT7WW" })

    this.#router.navigate(['/home'])
  }
}
