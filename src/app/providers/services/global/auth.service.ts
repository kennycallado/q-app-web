import { Injectable, computed, effect, inject, signal } from '@angular/core'
import { DOCUMENT } from '@angular/common'

import { Surreal as SurrealJS } from 'surrealdb.js'

import { StorageService } from '../storage.service'
import { OUTER_DB } from '../../constants'

@Injectable({
  providedIn: 'root'
})
export class GlobalAuthService {
  #storageSvc = inject(StorageService)
  #document   = inject(DOCUMENT)

  #outer_db = new SurrealJS()
  #db_url   = this.#document.location.hostname === 'localhost' ? "ws://localhost:8000" : OUTER_DB

  // ????
  #username = "kennycallado"
  #password = "password"
  #signin   = { namespace: 'global', database: 'main', scope: 'user', username: this.#username, password: this.#password }
  // ????

  #global_token = signal("")
  global_token  = computed(() => this.#global_token())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.load()
  })

  load() {
    if (!this.#password) return ; // show message ???

    this.#storageSvc.query<string>(undefined, `RETURN $global_token;`)
      .then(async (a_token) => {
        if (a_token.length === 0) {
          await this.#outer_db.connect(this.#db_url)
          this.#outer_db.signin(this.#signin).then(async (a_token) => {
            this.#storageSvc.query<string>(undefined, `LET $global_token = "${a_token}";`)
            this.#global_token.set(a_token)

            await this.#outer_db.close()
          })
        }
      })
  }
}

