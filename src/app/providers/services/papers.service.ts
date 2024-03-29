import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';
import { OutcomeService } from './interventions/outcome.service';
import { ContentService } from './interventions/content.service';

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

  #update_on_outers_ready = effect(() => {
    if (this.#storageSvc.ready() && this.#contentSvc.ready() && this.#outcomeSvc.ready()) this.load()
  })

  load() {
    this.#storageSvc.query(
      'interventions',
      `SELECT * FROM resources FETCH form, module, module.media, slides, slides.question, slides.media;`)
      .then((resources: [Resource[]]) => {
        this.#storageSvc.query(
          'interventions',
          `SELECT * FROM papers ORDER BY created DESC FETCH answers;`)
          .then((papers: [PaperWithResource[]]) => {
            papers[0].forEach((paper: Paper) => {
              paper.resource = resources[0].find(resource => resource.id === paper.resource)
            })

            this.#papers.set(papers[0])
          })
      })
  }

  async update(paper: PaperWithResource) {
    if (paper.answers.length > 0) {
      let answers_str = paper.answers.map(answer => JSON.stringify(answer)).join(',')

      this.#storageSvc.query('interventions', `INSERT INTO answers [${answers_str}];`)
        .then(async (answers: [Answer[]]) => {
          await this.#outcomeSvc.send_answers(answers[0])
          await this.#outcomeSvc.send_paper(new PaperToPush(paper.id, answers[0]))
        })

    } else {
      await this.#outcomeSvc.send_paper(new PaperToPush(paper.id))
    }
  }
}
