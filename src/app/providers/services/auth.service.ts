import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { Surreal as SurrealJS } from 'surrealdb.js'

import { StorageService } from './storage.service';
import { DOCUMENT } from '@angular/common';
import { OUTER_DB } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  #storageSvc = inject(StorageService)
  #document   = inject(DOCUMENT)

  #outer_db = new SurrealJS()
  #db_url   = this.#document.location.hostname === 'localhost' ? "ws://localhost:8000" : OUTER_DB

  // ????
  #pass    = "01HJTEBG4Y1EAXPATENCDCT7WW"
  #signin  = { namespace: "interventions", database: "demo", scope: "user", pass: this.#pass };
  // ????

  #access_token = signal("");
  access_token  = computed(() => this.#access_token())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.load();
  })

  load() {
    if (!this.#pass) return ;

    this.#storageSvc.query<string>(undefined, `RETURN $access_token;`)
      .then(async (a_token) => {
        if (a_token.length === 0) {
          await this.#outer_db.connect(this.#db_url)
          this.#outer_db.signin(this.#signin).then(async (a_token) => {
            this.#storageSvc.query<string>(undefined, `LET $access_token = "${a_token}";`)
            this.#access_token.set(a_token)
          })
        }
      })
  }
}
