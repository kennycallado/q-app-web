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
  #username = "kenny"
  #credentials   = { namespace: 'global', database: 'main', scope: 'user', username: this.#username }
  // ????

  #global_token = ""

  #ready = signal(false)
  ready = computed(() => this.#ready())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.#load()
  })

  /**
  * Authenticate the user with the database
  * @param db - The database to authenticate with
  *
  * @returns - A promise that resolves when the user is authenticated
  */
  async authenticate(db: SurrealJS): Promise<void> {
    try {
      await db.authenticate(this.#global_token)
    } catch (e) {

      console.error("Failed to authenticate: global/auth.service")
      console.error(e)

      await this.#signin(db)
      await this.authenticate(db)
    }
  }

  async #signin(db: SurrealJS): Promise<void> {
    let a_token = await db.signin(this.#credentials)
    await this.#storageSvc.query_global<string>(`DEFINE PARAM $global_token VALUE "${a_token}";`)

    this.#global_token = a_token
  }

  #load() {
    this.#storageSvc.query_global<string>(`RETURN $global_token;`)
      .then(async (a_token) => {
        if (a_token.length === 0) {
          await this.#outer_db.connect(this.#db_url)
          await this.#signin(this.#outer_db)
          await this.#outer_db.close()
        } else {
          this.#global_token = a_token[0]
        }

        this.#ready.set(true)
      })
  }
}
