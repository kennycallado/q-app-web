import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { OutcomeEntity } from '../types';
import { StorageService } from './storage.service';

import { Score } from '../models/score.model';

@Injectable({
  providedIn: 'root'
})
export class ScoresService {
  #storageSvc = inject(StorageService)

  #scores = signal({} as Score[]);
  scores  = computed(() => this.#scores());

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.load();
  })

  load() {
    this.#storageSvc.query<Score>(OutcomeEntity.scores, `SELECT * FROM scores ORDER BY created`)
      .then(scores => this.#scores.set(scores || {} as Score[]))
  }
}
