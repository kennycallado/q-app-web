import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { GlobalAuthService } from '../../providers/services/global/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass'
})
export class LoginComponent {
  #globalAuthSvc = inject(GlobalAuthService)
  #router = inject(Router)
  #route  = inject(ActivatedRoute)

  #activate_root = effect(() => {
    if (this.#globalAuthSvc.authenticated()) {
      const returnUrl = this.#route.snapshot.queryParams['returnUrl'] || '/home';
      this.#router.navigateByUrl(returnUrl);
    }
  })

  async submit(username: string) {
    if (!await this.#globalAuthSvc.login({ username })) { /** Show error dialog */ }
  }
}
