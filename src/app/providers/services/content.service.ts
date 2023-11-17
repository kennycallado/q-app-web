import { Injectable, computed, effect, inject, isDevMode, signal } from '@angular/core';

import { Surreal } from 'surrealdb/lib/full.js';
import { OUTER_DB } from '../constants';
import { StorageService } from './storage.service';
import { Resource } from '../models/resource.model';


export enum ContentEntity {
  media = 'media',
  questions = 'questions',
  resources = 'resources',
  slides = 'slides',
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  #storageSvc = inject(StorageService)

  #outer_db = new Surreal()
  // #db_url = !isDevMode() ? OUTER_DB : "ws://localhost:8000"
  #db_url = "http://localhost:8080"

  #connected  = signal(false)
  #resources  = signal([] as Resource[])
  resources   = computed(() => this.#resources())
  r_update    = effect(async () => {
    if (this.#connected()) this.#resources.set(await this.get<Resource>(ContentEntity.resources))
  })

  constructor() {
    (async () => {
      await this.#outer_db.connect(this.#db_url, undefined)
      await this.#outer_db.signin({ username: 'viewer', password: 'viewer', namespace: 'test' })
      this.#connected.set(true)
    })()
  }

  async get<T>(type: ContentEntity, id?: string): Promise<Array<T>> {
    let response = await this.#storageSvc.get<T>(type);
    if (response.length > 0)  response;

    try {
      await this.#outer_db.use({ ns: 'test', db: 'content' })

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
