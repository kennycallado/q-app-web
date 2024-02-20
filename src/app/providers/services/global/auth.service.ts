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

  #global_token = signal("")
  authenticated = computed(() => this.#global_token().length > 0)

  #ready = signal(false)
  ready  = computed(() => this.#ready())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.#load()
  })

  async global_login(username: string): Promise<boolean> {
    await this.#outer_db.connect(this.#db_url)
    return await this.#signin(this.#outer_db, username)
  }

  async global_authenticate(db: SurrealJS): Promise<boolean> {
    return await db.authenticate(this.#global_token())
  }

  async #signin(db: SurrealJS, username: string): Promise<boolean> {
    const credentials = { namespace: 'global', database: 'main', scope: 'user', username };

    try {
      this.#set_global_token(await db.signin(credentials))

      return true
    } catch (e) {
      this.#set_global_token("")

      return false
    }
  }

  #set_global_token(a_token: string) {
    this.#storageSvc
      .query_global<string>(`DEFINE PARAM $global_token VALUE "${a_token}";`)
      .then(() => {
        this.#global_token.set(a_token)
      })
  }

  #load() {
    this.#storageSvc
      .query_global<string>(`RETURN $global_token;`)
      .then(async (a_token) => {
        if (a_token.length === 0 || a_token[0].length === 0) {

          // redirect to login
          throw new Error("Failed to load global token: global/auth.service")

        } else this.#set_global_token(a_token[0])

        this.#ready.set(true)
      })
  }
}
