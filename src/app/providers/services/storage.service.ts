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
    await this.#inner_db.use({ namespace: 'global', database: this.#db_name })

    this.#inner_db.version().then(res => { if (res) this.#ready.set(true) })
  });

  /**
  * Query indexed database (namespace: global)
  *
  * @param namespace - Database namespace (e.g. 'global', 'interventions')
  * @param query - SQL query
  * @param params - SQL query parameters
  * @returns - Array of results
  */
  async query(namespace: string, query: string, params?: any) {
    let use = namespace === 'global'
      ? {namespace: 'global', database: 'main'}
      : {namespace: 'interventions', database: this.#db_name}

    await this.#inner_db.use(use)
    return await this.#inner_db.query(query, params)
  }

  async query_global(query: string, params?: any): Promise<Array<any>> {
    await this.#inner_db.use({ namespace: 'global', database: 'main' })
    return await this.#inner_db.query(query, params)
  }

  async query_interv(query: string, params?: any): Promise<Array<any>> {
    await this.#inner_db.use({ namespace: 'interventions', database: this.#db_name })
    return await this.#inner_db.query(query, params as Record<string, any>)
  }
}
