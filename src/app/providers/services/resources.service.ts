import { Injectable, computed, effect, inject, signal } from '@angular/core'

import { StorageService } from './storage.service'

import { Resource } from '../models/resource.model'

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  #storageSvc = inject(StorageService)

  #resources = signal([] as Resource[])
  resources = computed(() => this.#resources())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.load()
  })

  load() {
    this.#storageSvc.query('interventions', `SELECT * FROM resources;`)
      .then((resources: [Resource[]]) => this.#resources.set(resources[0]))
  }
}
