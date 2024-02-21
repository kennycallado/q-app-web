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
    console.log(await this.#global_authSvc.global_login("kenny"))

    setTimeout(() => {
      console.log(`globally auth: ${this.#global_authSvc.authenticated()}`)
      }, 500)
  }

  async interv_login() {
    console.log(await this.#interv_authSvc.interv_login("demo", "01HJTEBG4Y1EAXPATENCDCT7WW"))

    setTimeout(() => {
      console.log(`interv auth: ${this.#interv_authSvc.authenticated()}`)
      } , 500)
  }

  async getEso(entity: string) {
    let result = this.#storageSvc.query_interv(`SELECT * FROM ${entity};`)

    console.log((await result)[0])
  }
}
