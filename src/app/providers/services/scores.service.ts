import { Injectable, computed, effect, inject, signal } from '@angular/core'

import { StorageService } from './storage.service'

import { Score } from '../models/score.model'

@Injectable({
  providedIn: 'root'
})
export class ScoresService {
  #storageSvc = inject(StorageService)

  #scores = signal([] as Score[])
  scores  = computed(() => this.#scores())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.load()
  })

  load() {
    this.#storageSvc.query('interventions', `SELECT * FROM scores ORDER BY created;`)
      .then((scores: [Score[]]) => this.#scores.set(scores[0]))
  }
}
