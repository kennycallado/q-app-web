import { Injectable, computed, effect, inject, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { DOCUMENT } from '@angular/common'
import { Observable, catchError } from 'rxjs'

import { Surreal } from 'surrealdb/lib/full.js'

import { StorageService } from '../storage.service'

import { OUTER_AUTH, OUTER_DB } from '../../constants'
import { AuthLogin, AuthUser } from '../../models/user.model'

@Injectable({
  providedIn: 'root'
})
export class GlobalAuthService {
  #document   = inject(DOCUMENT)
  #http       = inject(HttpClient)
  #storageSvc = inject(StorageService)

  #outer_db = new Surreal()
  #db_url   = this.#document.location.hostname === 'localhost' ? "ws://localhost:8000" : OUTER_DB
  #auth_url = this.#document.location.hostname === 'localhost' ? "http://localhost:9000/auth" : OUTER_AUTH

  #global_token = signal("")
  authenticated = computed(() => this.#global_token().length > 0)

  #ready = signal(false)
  ready  = computed(() => this.#ready())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) setTimeout(() => this.#load(), 1) // wait for storage service to be ready
  })

  async login(data: AuthLogin): Promise<void> {
    const url = this.#auth_url + "/login"

    this.signin(url, data)
      .subscribe(async (result) => {
        if (typeof result === 'object') {
          this.#set_global_token(result.token)

          await this.#outer_db.connect(this.#db_url, undefined)
          await this.global_authenticate(this.#outer_db)

        } else this.#set_global_token("")
      })
  }

  async global_authenticate(db: Surreal): Promise<boolean> {
    if (!this.authenticated()) throw new Error("Global auth required: global/auth.service")

    return await db.authenticate(this.#global_token())
  }

  signin(url: string, body: Object): Observable<AuthUser | boolean> {
    let headers = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.#global_token()}`
    }

    return this.#http.post<AuthUser>(url, body, { headers })
      .pipe(
        catchError((err: Error) => {
          console.log(err) // manage status code to retry or not
          console.log("Failed to login: global/auth.service")

          // probably not the best way to handle this
          // should probably throw an error and handle it in the service
          return Promise.resolve(false)
        }),
      )
  }

  #set_global_token(a_token: string) {
    this.#storageSvc
      .query_global(`DEFINE PARAM $global_token VALUE "${a_token}";`)
      .then(() => { this.#global_token.set(a_token) })
  }

  #load() {
    this.#storageSvc
      .query_global(`RETURN $global_token;`)
      .then(async (a_token: [string]) => {
        if (a_token[0] === null || a_token[0] === undefined || a_token[0].length === 0) {

          // dialog error
          throw new Error("Failed to load global token: global/auth.service")
        } else this.#set_global_token(a_token[0])

        this.#ready.set(true)
      })
  }
}
