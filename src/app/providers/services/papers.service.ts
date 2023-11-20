import { Injectable, computed, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';
import { OutcomeEntity } from './outcome.service';

import { Paper } from '../models/paper.model';
import { Resource } from '../models/resource.model';
import { ContentEntity } from './content.service';

@Injectable({
  providedIn: 'root'
})
export class PapersService {
  #storageSvc = inject(StorageService)

  #waiting = true
  #papers = signal([] as Paper[])
  papers = computed(() => this.#papers())

  constructor() {
    (async () => await this.waiting())()
  }

  // wait for storage service to be ready
  private async waiting() {
    while (!this.#storageSvc.ready()) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    this.#waiting = false
    this.load()
  }

  load() {
    if (this.#waiting) return

    this.#storageSvc.query<Resource>(ContentEntity.resources, `SELECT * FROM resources FETCH form, module, module.media, slides, slides.question, slides.media`).then(resources => {
      this.#storageSvc.query<Paper>(OutcomeEntity.papers, `SELECT * FROM papers FETCH answers`).then(papers => {
        papers.forEach(paper => {
          paper.resource = resources.find(resource => resource.id === paper.resource)
        })

        this.#papers.set(papers || [])
      })
    })
  }
}
