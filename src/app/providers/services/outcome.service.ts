import { Injectable, inject, isDevMode } from '@angular/core';

import { Surreal as SurrealJS } from 'surrealdb.js'

import { OUTER_DB } from '../constants';
import { StorageService } from './storage.service';

import { Paper } from '../models/paper.model';
import { Record as Score } from '../models/record.model';
import { PapersService } from './papers.service';

export enum OutcomeEntity {
  answers = 'answers',
  papers = 'papers',
  records = 'records',
  scripts = 'scripts',
}

@Injectable({
  providedIn: 'root'
})
export class OutcomeService {
  #storageSvc = inject(StorageService)
  #papersSvc  = inject(PapersService)

  #outer_db = new SurrealJS()
  // #db_url = !isDevMode() ? OUTER_DB : "ws://localhost:8080"
  #db_url = "ws://localhost:8080"

  constructor() {
    (async () => {
      await this.#outer_db.connect(this.#db_url, undefined)
      await this.#outer_db.signin({ username: 'viewer', password: 'viewer', namespace: 'test' })

      await this.live_papers()
      await this.live_scores()
    })()
  }

  async live_scores() {
    await this.#outer_db.use({ namespace: 'test', database: 'outcome' })

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
          record: ${JSON.stringify(score.record)},
          created: ${JSON.stringify(score.created)},
        }`)
    }

    // live
    await this.#outer_db.live('records',
      async ({action, result}) => {
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
                record: ${JSON.stringify(result.record)},
                created: ${JSON.stringify(result.created)},
              };`)

            break;
          default:
            console.log('unknown action', action);
        }
      });
  }

  async live_papers() {
    // there is a way to ask just for the changes, but I don't know how
    // so I'm just going to ask for the whole thing and compare it with the local

    await this.#outer_db.use({ namespace: 'test', database: 'outcome' })

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
        }`)
    }

    // live
    await this.#outer_db.live('papers',
      async ({action, result}) => {
        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query(OutcomeEntity.papers, `DELETE ${result}`)

            // reload papers
            this.#papersSvc.load();

            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query(OutcomeEntity.papers,
              `UPDATE ${result.id} CONTENT {
                resource: ${result.resource},
                user: ${result.user},
                completed: ${result.completed},
                answers: ${JSON.stringify(result.answers)},
              }`)

            // reload papers
            this.#papersSvc.load();

            break;
          default:
            console.log('unknown action', action);
        }
      });
  }

//   async get<T>(type: OutcomeEntity, id?: string): Promise<Array<T>> {
//     let response = await this.#storageSvc.get<T>(type);
//     if (response.length > 0) return response;

//     try {
//       await this.#outer_db.use({ ns: 'test', db: 'outcome' })

//       let r: Array<T> = await this.#outer_db.select(type);
//       r.forEach(async (item: T) => {
//         await this.#storageSvc.update(type, item);
//       })

//       return r;
//     } catch (e) {
//       console.log(e);
//       return [];
//     }
//   }
}
