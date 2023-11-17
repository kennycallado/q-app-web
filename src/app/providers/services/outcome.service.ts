import { Injectable, computed, effect, inject, isDevMode, signal } from '@angular/core';

import { Surreal } from 'surrealdb/lib/full.js';
import { OUTER_DB } from '../constants';
import { StorageService } from './storage.service';
import { Paper } from '../models/paper.model';

export enum OutcomeEntity {
  answers = 'answers',
  papers = 'papers',
  records = 'records',
  scripts = 'scripts',
}

@Injectable({
  providedIn: 'root'
})
export class OutcomeService {
  #storageSvc = inject(StorageService)

  #outer_db = new Surreal()
  // #db_url = !isDevMode() ? OUTER_DB : "ws://localhost:8000"
  #db_url = "http://localhost:8080"

  #connected = signal(false)
  #papers    = signal([] as Paper[])
  papers     = computed(() => this.#papers())
  p_update   = effect(async () => {
    if (this.#connected()) this.#papers.set(await this.get<Paper>(OutcomeEntity.papers))
  })

  constructor() {
    (async () => {
      await this.#outer_db.connect(this.#db_url, undefined)
      await this.#outer_db.signin({ username: 'viewer', password: 'viewer', namespace: 'test' })
      this.#connected.set(true)
    })()
  }

  async get<T>(type: OutcomeEntity, id?: string): Promise<Array<T>> {
    let response = await this.#storageSvc.get<T>(type);
    if (response.length > 0) return response;

    try {
      await this.#outer_db.use({ ns: 'test', db: 'outcome' })

      let r: Array<T> = await this.#outer_db.select(type);
      r.forEach(async (item: T) => {
        await this.#storageSvc.update(type, item);
      })

      return r;
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
