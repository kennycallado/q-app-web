import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';
import { OutcomeService } from './api/outcome.service';
import { ContentService } from './api/content.service';

import { ContentEntity, OutcomeEntity } from '../types';
import { Paper, PaperToPush, PaperWithResource } from '../models/paper.model';
import { Resource } from '../models/resource.model';
import { Answer } from '../models/answer.model';

@Injectable({
  providedIn: 'root'
})
export class PapersService {
  #storageSvc = inject(StorageService)
  #outcomeSvc = inject(OutcomeService)
  #contentSvc = inject(ContentService)

  #papers = signal([] as PaperWithResource[])
  papers = computed(() => this.#papers())

  #update_on_storage_ready = effect(() => {
    if (this.#storageSvc.ready()) this.load()
  })

  #update_on_outers_ready = effect(() => {
    if (this.#contentSvc.ready() && this.#outcomeSvc.ready()) this.load()
  })

  load() {
    this.#storageSvc.query<Resource>(ContentEntity.resources, `SELECT * FROM resources FETCH form, module, module.media, slides, slides.question, slides.media`)
      .then(resources => {
        this.#storageSvc.query<PaperWithResource>(OutcomeEntity.papers, `SELECT * FROM papers ORDER BY created DESC FETCH answers`)
          .then(papers => {
            papers.forEach((paper: Paper) => {
              paper.resource = resources.find(resource => resource.id === paper.resource)
            })

            this.#papers.set(papers || [])
          })
      })
  }

  async update(paper: PaperWithResource) {
    if (paper.answers.length) {
      this.#storageSvc.query<Answer>(
        OutcomeEntity.answers,
        `INSERT INTO answers [${paper.answers.map(answer => JSON.stringify(answer)).join(',')}]`
      ).then(async (res) => {
        let paperToPush = { ...paper, answers: res.map(answer => answer.id), resource: paper.resource.id }

        await this.#outcomeSvc.send_answers(res)
        await this.#outcomeSvc.send_paper(paperToPush)
      })
    } else {
      let paperToPush = new PaperToPush(paper.id, paper.user, paper.resource, paper.completed, paper.created, paper.answers)

      await this.#outcomeSvc.send_paper(paperToPush)
    }
  }
}
