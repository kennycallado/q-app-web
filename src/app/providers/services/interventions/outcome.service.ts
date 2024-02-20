import { Injectable, Injector, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { Surreal as SurrealJS } from 'surrealdb.js'

import { StorageService } from '../storage.service';
import { PapersService } from '../papers.service';
import { IntervAuthService } from '../interventions/auth.service';

import { OUTER_DB } from '../../constants';
import { Paper, PaperToPush, TPaper } from '../../models/paper.model';
import { Answer, TAnswer } from '../../models/answer.model';
import { Score, TScore } from '../../models/score.model';

@Injectable({
  providedIn: 'root'
})
export class OutcomeService {
  #authSvc    = inject(IntervAuthService)
  #storageSvc = inject(StorageService)
  #injector   = inject(Injector) // very important to avoid circular dependencies
  #document   = inject(DOCUMENT)

  #outer_db = new SurrealJS()
  #db_url = this.#document.location.hostname === 'localhost' ? "ws://localhost:8000" : OUTER_DB

  #ready = signal(false)
  ready = computed(() => this.#ready())

  #update = effect(async () => {
    if (
        this.#storageSvc.ready !== undefined &&
        this.#storageSvc.ready() &&
        this.#authSvc.ready()
    ) {

      await this.#outer_db.connect(this.#db_url, undefined)
      await this.#authSvc.interv_authenticate(this.#outer_db)

      // init live queries
      await this.#live_answers()
      await this.#live_papers()
      await this.#live_scores()

      this.#ready.set(true)
    }
  })

  async send_answers(answers: Answer[]): Promise<any> {
    let answers_str = answers.map((answer: Answer) => JSON.stringify(answer)).join(',');
    return await this.#outer_db.query(`INSERT INTO answers [${answers_str}]`)
  }

  // async send_paper(paper: PaperToPush): Promise<any> {
  async send_paper(paper: PaperToPush): Promise<void> {
    await this.#outer_db.query(`fn::on_push(${paper.id}, ${JSON.stringify(paper.answers)})`)
  }

  async #live_answers() {
    // there is a way to ask just for the changes, but I don't know how
    // so I'm just going to ask for the whole thing and compare it with the local

    let coming_answers = await this.#outer_db.select<TAnswer>('answers');
    let local_answers  = await this.#storageSvc.query_interv<Answer>(`SELECT * FROM answers;`);

    // detect deletes
    for (let answer of local_answers) {
      if (!coming_answers.find(a => a.id === answer.id)) {
        await this.#storageSvc.query_interv<Answer>(`DELETE ${answer.id};`);
      }
    }

    // detect updates
    // should update ??
    for (let answer of coming_answers) {
      await this.#storageSvc.query_interv<Answer>(
        `UPDATE ${answer.id} MERGE {
          answer: ${answer.answer},
          question: ${answer.question},
        };`)
    }

    // live
    await this.#outer_db.live('answers',
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query_interv<Answer>(`DELETE ${result.id};`)
            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query_interv(
              `UPDATE ${result.id} MERGE {
                answer: ${result.answer},
                question: ${result.question},
              };`)

            break;
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
      })
  }

  async #live_scores() {
    // get both scores
    let coming_score = await this.#outer_db.select<TScore>('scores');
    let local_score  = await this.#storageSvc.query_interv<Score>(`SELECT * FROM scores;`);

    // detect deletes
    for (let score of local_score) {
      if (!coming_score.find(r => r.id === score.id)) {
        await this.#storageSvc.query_interv<Score>(`DELETE ${score.id};`);
      }
    }

    // detect updates
    for (let score of coming_score) {
      await this.#storageSvc.query_interv<Score>(
        `UPDATE ${score.id} CONTENT {
          user: ${score.user},
          score: ${JSON.stringify(score.score)},
          created: ${JSON.stringify(score.created)},
        };`)
    }

    // live
    await this.#outer_db.live('scores',
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query_interv<Score>(`DELETE ${result.id};`)
            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query_interv<Score>(
              `UPDATE ${result.id} CONTENT {
                user: ${result.user},
                score: ${JSON.stringify(result.score)},
                created: ${JSON.stringify(result.created)},
              };`)

            break;
          default:
            console.log('unknown action', action);
        }

        papersSvc.load()
      })
  }

  async #live_papers() {
    // there is a way to ask just for the changes, but I don't know how
    // so I'm just going to ask for the whole thing and compare it with the local

    let coming_papers = await this.#outer_db.select<TPaper>('papers');
    let local_papers  = await this.#storageSvc.query_interv<Paper>(`SELECT * FROM papers;`);

    // detect deletes
    // papers should never be deleted, but just in case
    for (let paper of local_papers) {
      if (!coming_papers.find(p => p.id === paper.id)) {
        await this.#storageSvc.query_interv<Paper>(`DELETE ${paper.id};`);
      }
    }

    // detect updates
    for (let paper of coming_papers) {
      await this.#storageSvc.query_interv<Paper>(
        `UPDATE ${paper.id} CONTENT {
          resource: ${paper.resource},
          user: ${paper.user},
          completed: ${paper.completed},
          answers: ${JSON.stringify(paper.answers)},
          created: ${JSON.stringify(paper.created)},
        };`)
    }

    // live
    await this.#outer_db.live('papers',
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query_interv<Paper>(`DELETE ${result.id};`)
            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query_interv<Paper>(
              `UPDATE ${result.id} CONTENT {
                resource: ${result.resource},
                user: ${result.user},
                completed: ${result.completed},
                answers: ${JSON.stringify(result.answers)},
                created: ${JSON.stringify(result.created)},
              };`)

            break;
          default:
            console.log('unknown action', action);
        }

        papersSvc.load()
      }, false);
  }
}
