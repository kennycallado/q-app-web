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
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    this.#waiting = false

    await this.load()
  }

  async load() {
    if (this.#waiting) return

    const papers = await this.#storageSvc.query<Paper>(OutcomeEntity.papers, `SELECT * FROM papers FETCH answers`)
    const resources = await this.#storageSvc.query<Resource>(ContentEntity.resources, `SELECT * FROM resources FETCH form, module, module.media, slides, slides.question, slides.media`)

    papers.forEach(paper => {
      paper.resource = resources.find(r => r.id == paper.resource)
    })

    this.#papers.set(papers || [])
  }
}
