import { Injectable, computed, effect, inject, signal } from '@angular/core'
import { DOCUMENT } from '@angular/common'

import { Surreal as SurrealJS } from 'surrealdb.js'

import { StorageService } from '../storage.service'
import { OUTER_DB } from '../../constants'

@Injectable({
  providedIn: 'root'
})
export class InterAuthService {
  #storageSvc = inject(StorageService)
  #document   = inject(DOCUMENT)

  #outer_db = new SurrealJS()
  #db_url   = this.#document.location.hostname === 'localhost' ? "ws://localhost:8000" : OUTER_DB

  // ????
  #project = "demo"
  #pass    = "01HJTEBG4Y1EAXPATENCDCT7WW"
  #signin  = { namespace: "interventions", database: this.#project, scope: "user", pass: this.#pass }
  // ????

  #inter_token = signal("")
  inter_token  = computed(() => this.#inter_token())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.load()
  })

  load() {
    if (!this.#pass) return ;

    this.#storageSvc.query<string>(undefined, `RETURN $inter_token;`)
      .then(async (a_token) => {
        if (a_token.length === 0) {
          await this.#outer_db.connect(this.#db_url)
          this.#outer_db.signin(this.#signin).then(async (a_token) => {
            this.#storageSvc.query<string>(undefined, `LET $inter_token = "${a_token}";`)
            this.#inter_token.set(a_token)

            await this.#outer_db.close()
          })
        }
      })
  }
}
