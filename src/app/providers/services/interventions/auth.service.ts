import { Injectable, computed, effect, inject, signal } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { lastValueFrom } from 'rxjs'

import { Surreal } from 'surrealdb/lib/full.js'

import { GlobalAuthService } from '../global/auth.service'
import { StorageService } from '../storage.service'

import { OUTER_AUTH, OUTER_DB } from '../../constants'
import { AuthJoin } from '../../models/user.model'

@Injectable({
  providedIn: 'root'
})
export class IntervAuthService {
  #document      = inject(DOCUMENT)
  #storageSvc    = inject(StorageService)
  #globalAuthSvc = inject(GlobalAuthService)

  #outer_db = new Surreal()
  #db_url   = this.#document.location.hostname === 'localhost' ? "ws://localhost:8000" : OUTER_DB
  #auth_url = this.#document.location.hostname === 'localhost' ? "http://localhost:9000/auth" : OUTER_AUTH

  #interv_token = signal("")
  authenticated = computed(() => this.#interv_token().length > 0)

  #ready = signal(false)
  ready  = computed(() => this.#ready())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready() && this.#globalAuthSvc.authenticated()) this.#load()
  })

  logout() {
    this.#set_interv_token("")
  }

  async join(data: AuthJoin): Promise<boolean> {
    if (!this.#globalAuthSvc.authenticated()) throw new Error("Global auth required: interventions/auth.service")

    const url = this.#auth_url + "/join"
    const prom$ = lastValueFrom(this.#globalAuthSvc.signin(url, data)).then(async (result) => {
      if (typeof result === 'object') {
        this.#set_interv_token(result.token)

        await this.#outer_db.connect(this.#db_url)
        await this.interv_authenticate(this.#outer_db)

        return true
      }

      this.#set_interv_token("")
      return false
    })

    return prom$
  }

  async interv_authenticate(db: Surreal): Promise<boolean> {
    if (!this.#globalAuthSvc.authenticated()) throw new Error("Global auth required: interventions/auth.service")

    return await db.authenticate(this.#interv_token())
  }

  #set_interv_token(a_token: string) {
    this.#storageSvc
      .query_global(`DEFINE PARAM $interv_token VALUE "${a_token}";`) // should use global ns
      .then(() => { this.#interv_token.set(a_token); if (!this.ready()) this.#ready.set(true) })
  }

  #load() {
    this.#storageSvc
      .query_global(`RETURN $interv_token;`)
      .then(async (a_token: [string]) => {
        if (a_token[0] === null || a_token[0] === undefined || a_token[0].length === 0) {

          // dialog error
          throw new Error("Failed to load interv token: interventions/auth.service")
        } else this.#set_interv_token(a_token[0])

        this.#ready.set(true)
      })
  }
}
