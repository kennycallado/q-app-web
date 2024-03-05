import { Component, inject } from '@angular/core';

import { StorageService } from '../../providers/services/storage.service';
import { IntervAuthService } from '../../providers/services/interventions/auth.service';
import { GlobalAuthService } from '../../providers/services/global/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {
  #storageSvc = inject(StorageService)
  #interv_authSvc   = inject(IntervAuthService)
  #global_authSvc   = inject(GlobalAuthService)

  async global_login() {
    await this.#global_authSvc.login({ username: "kenny" })
  }

  async interv_login() {
    await this.#interv_authSvc.join({ ns: "interventions", db: "demo", sc: "user", pass: "01HJTEBG4Y1EAXPATENCDCT7WW" })
  }

  async getEso(entity: string) {
    let result = this.#storageSvc.query('interventions', `SELECT * FROM ${entity};`)

    console.log((await result)[0])
  }
}
