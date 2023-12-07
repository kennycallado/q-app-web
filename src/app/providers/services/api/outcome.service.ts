import { Injectable, Injector, computed, effect, inject, isDevMode, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { Surreal as SurrealJS } from 'surrealdb.js'

import { OUTER_DB } from '../../constants';
import { StorageService } from '../storage.service';
import { PapersService } from '../papers.service';

import { OutcomeEntity } from '../../types';
import { Paper, PaperToPush } from '../../models/paper.model';
import { Record as Score } from '../../models/record.model';
import { Answer } from '../../models/answer.model';

@Injectable({
  providedIn: 'root'
})
export class OutcomeService {
  #storageSvc = inject(StorageService)
  #injector   = inject(Injector) // very important to avoid circular dependencies
  #document   = inject(DOCUMENT)

  #outer_db = new SurrealJS()
  #db_url = this.#document.location.hostname === 'localhost' ? "http://localhost:8000" : OUTER_DB

  #ready = signal(false)
  ready = computed(() => this.#ready())

  #update = effect(async () => {
    if (this.#storageSvc.ready !== undefined && this.#storageSvc.ready()) {
      await this.#outer_db.connect(this.#db_url, undefined)
      await this.#outer_db.use({ namespace: 'projects', database: 'demo' })

      await this.#auth()

      await this.#live_answers()
      await this.#live_papers()
      // await this.#live_scores()

      this.#ready.set(true)
    }
  })

  async send_answers(answers: any): Promise<any> {
    return await this.#outer_db.query(`INSERT INTO answers [${answers.map((answer: any) => JSON.stringify(answer)).join(',')}]`)
  }

  // async send_paper(paper: PaperToPush): Promise<any> {
  async send_paper(paper: PaperToPush) {
    // console.log('sending paper', paper)
    // if (paper.answers.length === 0) {
    //   await this.#outer_db.update(paper.id, { ...paper })

    //   return await this.#outer_db.query_raw(`fn::on_push($paper)`, { paper: JSON.stringify(paper) })
    // } else {
      await this.#outer_db.update(paper.id, { ...paper })
      await this.#outer_db.query_raw(`LET $paper = (SELECT * FROM ${paper.id})[0]; fn::on_push($paper)`)
    // }
  }

  async #auth() {
    await this.#outer_db.signin({ username: 'root', password: 'root' })
    // await this.#outer_db.signin({ username: 'viewer', password: 'viewer', namespace: 'test' })
  }

  async #live_answers() {
    // there is a way to ask just for the changes, but I don't know how
    // so I'm just going to ask for the whole thing and compare it with the local

    let coming_answers = await this.#outer_db.select(OutcomeEntity.answers);
    let local_answers = await this.#storageSvc.get<Answer>(OutcomeEntity.answers);

    // detect deletes
    for (let answer of local_answers) {
      if (!coming_answers.find(a => a.id === answer.id)) {
        await this.#storageSvc.query(OutcomeEntity.answers, `DELETE ${answer.id}`);
      }
    }

    // detect updates
    // should update ??
    for (let answer of coming_answers) {
      await this.#storageSvc.query(OutcomeEntity.answers,
        `UPDATE ${answer.id} MERGE {
          answer: ${answer.answer},
          question: ${answer.question},
        }`)
    }

    // live
    await this.#outer_db.live('answers',
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query(OutcomeEntity.answers, `DELETE ${result}`)
            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query(OutcomeEntity.answers,
              `UPDATE ${result.id} MERGE {
                answer: ${result.answer},
                question: ${result.question},
              }`)

            break;
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
      })
  }

  async #live_scores() {
    // get both scores
    let coming_score = await this.#outer_db.select(OutcomeEntity.records);
    let local_score = await this.#storageSvc.get<Score>(OutcomeEntity.records);

    // detect deletes
    for (let score of local_score) {
      if (!coming_score.find(r => r.id === score.id)) {
        await this.#storageSvc.query(OutcomeEntity.records, `DELETE ${score.id}`);
      }
    }

    // detect updates
    for (let score of coming_score) {
      await this.#storageSvc.query(OutcomeEntity.records,
        `UPDATE ${score.id} CONTENT {
          user: ${score.user},
          record: ${score.record},
          created: ${JSON.stringify(score.created)},
        }`)
    }

    // live
    await this.#outer_db.live('records',
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query(OutcomeEntity.records, `DELETE ${result}`)
            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query(OutcomeEntity.records,
              `UPDATE ${result.id} CONTENT {
                user: ${result.user},
                created: ${JSON.stringify(result.created)},
              };`)
                // record: ${result.record},

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

    let coming_papers = await this.#outer_db.select('papers');
    let local_papers = await this.#storageSvc.get<Paper>(OutcomeEntity.papers);

    // detect deletes
    // papers should never be deleted, but just in case
    for (let paper of local_papers) {
      if (!coming_papers.find(p => p.id === paper.id)) {
        await this.#storageSvc.query(OutcomeEntity.papers, `DELETE ${paper.id}`);
      }
    }

    // detect updates
    for (let paper of coming_papers) {
      await this.#storageSvc.query(OutcomeEntity.papers,
        `UPDATE ${paper.id} CONTENT {
          resource: ${paper.resource},
          user: ${paper.user},
          completed: ${paper.completed},
          answers: ${JSON.stringify(paper.answers)},
          created: ${JSON.stringify(paper.created)},
        }`)
    }

    // live
    await this.#outer_db.live('papers',
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            // creo que result.id
            await this.#storageSvc.query(OutcomeEntity.papers, `DELETE ${result}`)
            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query(OutcomeEntity.papers,
              `UPDATE ${result.id} CONTENT {
                resource: ${result.resource},
                user: ${result.user},
                completed: ${result.completed},
                answers: ${JSON.stringify(result.answers)},
                created: ${JSON.stringify(result.created)},
              }`)

            break;
          default:
            console.log('unknown action', action);
        }

        papersSvc.load()
      }, false);
  }
}
