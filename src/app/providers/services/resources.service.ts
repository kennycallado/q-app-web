import { Injectable, computed, inject, signal } from '@angular/core';

import { ContentEntity } from './content.service';
import { StorageService } from './storage.service';

import { Resource } from '../models/resource.model';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  #storageSvc = inject(StorageService)

  #waiting = true
  #resources = signal([] as Resource[])
  resources = computed(() => this.#resources())

  constructor() {
    (async () => await this.waiting())()
  }

  private async waiting() {
    while (!this.#storageSvc.ready()) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    this.#waiting = false

    await this.load()
  }

  async load() {
    if (this.#waiting) return

    const resources = await this.#storageSvc.query<Resource>(
      ContentEntity.resources,
      `SELECT * FROM resources FETCH form, modules, slides, slides.question`
    )

    this.#resources.set(resources || [])
  }
}
