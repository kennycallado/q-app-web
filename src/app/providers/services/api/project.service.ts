import { Injectable, Injector, computed, effect, inject, signal } from '@angular/core';

import { Surreal as SurrealJS } from 'surrealdb.js'

import { OUTER_DB } from '../../constants';
import { StorageService } from '../storage.service';
import { ProjectEntity } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  #storageSvc = inject(StorageService)
  #injector   = inject(Injector)

  #outer_db = new SurrealJS()
  // #db_url = !isDevMode() ? OUTER_DB : "http://localhost:8000"
  #db_url = "http://localhost:8000"

  #ready = signal(false)
  ready = computed(() => this.#ready())

  #update = effect(async () => {
    if (this.#storageSvc.ready !== undefined && this.#storageSvc.ready()) {
      await this.#outer_db.connect(this.#db_url, undefined)
      await this.#outer_db.use({ namespace: 'main', database: 'project' })

      await this.#auth()

      await this.#sync_users()

      this.#ready.set(true)
    }
  })

  async #auth() {
    await this.#outer_db.signin({ username: 'root', password: 'root' })
  }

  // async #sync_projects() {}

  // sync projects through users
  async #sync_users() {
    const coming = await this.#outer_db.query_raw(`SELECT * FROM users FETCH project`, undefined)
    const result = coming[0].result[0]

    await this.#storageSvc.query(
      ProjectEntity.users,
      `UPDATE ${result.id} CONTENT ${JSON.stringify(result)}`
     )
  }
}
