import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { IntervAuthService } from '../../providers/services/interventions/auth.service';
import { AuthJoin } from '../../providers/models/user.model';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrl: './join.component.sass'
})
export class JoinComponent {
  #intervAuthSvc = inject(IntervAuthService)
  #router = inject(Router)
  #route  = inject(ActivatedRoute)

  #activate_root = effect(() => {
    if (this.#intervAuthSvc.authenticated()) {
      const returnUrl = this.#route.snapshot.queryParams['returnUrl'] || '/home';
      this.#router.navigateByUrl(returnUrl);
    }
  })

  async submit(pass: string) {
    const cred: AuthJoin = {
      ns: "interventions",
      db: "demo",
      sc: "user",
      pass // 01HJTEBG4Y1EAXPATENCDCT7WW
    }

    if (!await this.#intervAuthSvc.join(cred)) { /** Show error dialog */ }
  }
}
