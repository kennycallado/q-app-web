import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';
import { OutcomeService } from './interventions/outcome.service';
import { ContentService } from './interventions/content.service';

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
    if (paper.answers.length > 0) {
      let answers_str = paper.answers.map(answer => JSON.stringify(answer)).join(',')

      this.#storageSvc.query_inter<Answer>(`INSERT INTO answers [${answers_str}]`)
        .then(async (answers: Answer[]) => {
          await this.#outcomeSvc.send_answers(answers)
          await this.#outcomeSvc.send_paper(new PaperToPush(paper.id, answers))
        })

    } else {
      await this.#outcomeSvc.send_paper(new PaperToPush(paper.id))
    }
  }
}
