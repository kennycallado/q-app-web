import { Injectable, computed, effect, signal } from '@angular/core';

import { Surreal } from 'surrealdb/lib/full.js';

import { INNER_DB } from '../constants';
import { ContentEntity, OutcomeEntity } from '../types';

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
    await this.init();
  });

  async query<T>(
    key: ContentEntity | OutcomeEntity | undefined,
    query: string,
    params?: any
  ): Promise<Array<T>> {
    try {
      await this.#inner_db.use({ ns: 'interventions', db: this.#db_name })
      return await this.#inner_db.query(query, params);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async get<T>(key: ContentEntity | OutcomeEntity, id?: string): Promise<Array<T>> {
    try {
      await this.#inner_db.use({ ns: 'interventions', db: this.#db_name })
      return await this.#inner_db.select(key);
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async set<T>(key: ContentEntity | OutcomeEntity, content: any): Promise<T> {
    try {
      await this.#inner_db.use({ ns: 'interventions', db: this.#db_name })
      return await this.#inner_db.create(key, content);
    } catch (e) {
      if (e.includes('already exists')) {
        return this.update<T>(key, content);
      } else {
        console.error(e);
        return;
      }
    }
  }

  async update<T>(key: ContentEntity | OutcomeEntity, content: T): Promise<T> {
    try {
      await this.#inner_db.use({ ns: 'interventions', db: this.#db_name })
      return await this.#inner_db.update(key, content);
    } catch (e) {
      console.error(e);
      return;
    }
  }

  private async init() {
    // prepare db
    await this.#inner_db.connect(INNER_DB, { capabilities: true })
    await this.#inner_db.use({ ns: 'global', db: this.#db_name })

    this.#inner_db
      .version()
      .then(res => { if (res) this.#ready.set(true) })
  }

  // private async init() {
  //   // should be just definitions
  //   await this.#inner_db.use({ ns: 'projects', db: 'projects' })
  //   await this.#inner_db.query(project_dump, undefined)

  //   await this.#inner_db.use({ ns: 'projects', db: 'demo' })
  //   // await this.#inner_db.query(content_dump, undefined)
  //   // await this.#inner_db.query(outcome_dump, undefined)
  // }
}
