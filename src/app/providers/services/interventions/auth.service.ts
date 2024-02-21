import { Injectable, computed, effect, inject, signal } from '@angular/core'
import { DOCUMENT } from '@angular/common'

import { Surreal } from 'surrealdb/lib/full.js'

import { StorageService } from '../storage.service'
import { OUTER_DB } from '../../constants'
import { GlobalAuthService } from '../global/auth.service'

@Injectable({
  providedIn: 'root'
})
export class IntervAuthService {
  #globalAuthSvc = inject(GlobalAuthService)
  #storageSvc = inject(StorageService)
  #document   = inject(DOCUMENT)

  #outer_db = new Surreal()
  #db_url   = this.#document.location.hostname === 'localhost' ? "ws://localhost:8000" : OUTER_DB

  // ????
  // #project = "demo"
  // #pass    = "01HJTEBG4Y1EAXPATENCDCT7WW"
  // ????

  #interv_token = signal("")
  authenticated = computed(() => this.#interv_token().length > 0)

  #ready = signal(false)
  ready  = computed(() => this.#ready())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready() && this.#globalAuthSvc.authenticated()) this.#load()
  })

  async interv_login(project: string, pass: string): Promise<boolean> {
    if (!this.#globalAuthSvc.authenticated()) throw new Error("Global auth required: interventions/auth.service")

    await this.#outer_db.connect(this.#db_url)
    return await this.#signin(this.#outer_db, project, pass)
  }

  async interv_authenticate(db: Surreal): Promise<boolean> {
    if (!this.#globalAuthSvc.authenticated()) throw new Error("Global auth required: interventions/auth.service")

    return await db.authenticate(this.#interv_token())
  }

  async #signin(db: Surreal, project: string, pass: string): Promise<boolean> {
    const credentials = { namespace: 'interventions', database: project, scope: 'user', pass };

    try {
      this.#set_interv_token(await db.signin(credentials))

      return true
    } catch (e) {
      this.#set_interv_token("")

      return false
    }
  }

  #set_interv_token(a_token: string) {
    this.#storageSvc
      .query_global(`DEFINE PARAM $interv_token VALUE "${a_token}";`) // should use global ns
      .then(() => {
        this.#interv_token.set(a_token)
      })
  }

  #load() {
    this.#storageSvc
      .query_global(`RETURN $interv_token;`) // should use global ns
      .then(async (a_token: [string]) => {
        if (a_token[0] === null) {

          // redirect to join project
          throw new Error("Failed to load interv token: interventions/auth.service")

        } else this.#set_interv_token(a_token[0])

        this.#ready.set(true)
      })
  }
}
