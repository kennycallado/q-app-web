import { Injectable, computed, effect, signal } from '@angular/core';

import { Surreal } from 'surrealdb/lib/full.js';

import { INNER_DB } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  #inner_db = new Surreal();

  #ready = signal(false);
  ready = computed(() => this.#ready());

  // ????
  #db_name = "demo"
  // ????

  #update = effect(async () => {
    await this.#inner_db.connect(INNER_DB, { capabilities: true })
    await this.#inner_db.use({ ns: 'global', db: this.#db_name })

    this.#inner_db.version().then(res => { if (res) this.#ready.set(true) })
  });

  async query_global<T>(query: string, params?: any): Promise<Array<T>> {
    try {
      await this.#inner_db.use({ ns: 'global', db: 'main' })
      return await this.#inner_db.query(query, params)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  async query_interv<T>(query: string, params?: any): Promise<Array<T>> {
    try {
      await this.#inner_db.use({ ns: 'interventions', db: this.#db_name })
      return await this.#inner_db.query(query, params)
    } catch (e) {
      console.error(e)
      return []
    }
  }
}
