import { Injectable, Injector, computed, effect, inject, signal } from '@angular/core'
import { DOCUMENT } from '@angular/common'

import { Surreal } from 'surrealdb/lib/full.js'

import { StorageService } from '../storage.service'
import { PapersService } from '../papers.service'
import { IntervAuthService } from '../interventions/auth.service'

import { OUTER_DB } from '../../constants'
import { Paper, PaperToPush, TPaper } from '../../models/paper.model'
import { Answer, TAnswer } from '../../models/answer.model'
import { Score, TScore } from '../../models/score.model'

@Injectable({
  providedIn: 'root'
})
export class OutcomeService {
  #intervAuthSvc = inject(IntervAuthService)
  #storageSvc = inject(StorageService)
  #injector   = inject(Injector) // very important to avoid circular dependencies
  #document   = inject(DOCUMENT)

  #outer_db = new Surreal()
  #db_url = this.#document.location.hostname === 'localhost' ? "ws://localhost:8000" : OUTER_DB

  #ready = signal(false)
  ready = computed(() => this.#ready())

  #update = effect(async () => {
    if (this.#storageSvc.ready() && this.#intervAuthSvc.ready()) {

      if (navigator.onLine) {
        await this.#outer_db.connect(this.#db_url)
        await this.#intervAuthSvc.interv_authenticate(this.#outer_db)

        // init live queries
        await this.#live_answers()
        await this.#live_papers()
        await this.#live_scores()
      }

      this.#ready.set(true)
    }
  })

  async send_answers(answers: Answer[]): Promise<any> {
    let answers_str = answers.map((answer: Answer) => JSON.stringify(answer)).join(',')
    return await this.#outer_db.query(`INSERT INTO answers [${answers_str}];`)
  }

  async send_paper(paper: PaperToPush): Promise<void> {
    await this.#outer_db.query(`fn::on_push(${paper.id}, ${JSON.stringify(paper.answers)})`)
  }

  async #live_answers() {
    let local_answers:  Answer[] = (await this.#storageSvc.query_interv(`SELECT * FROM answers;`))[0]
    let coming_answers: Answer[] = await this.#outer_db
      .select('answers')
      .then((tAnswers: TAnswer[]) => tAnswers.map((answer: Answer) => {
        return {
          id: answer.id,
          answer: JSON.stringify(answer.answer),
          question: answer.question,
        }
      }))

    // detect deletes
    for (let answer of local_answers) {
      if (!coming_answers.find(a => a.id === answer.id)) {
        await this.#storageSvc.query_interv(`DELETE ${answer.id};`)
      }
    }

    // detect updates
    // should update ??
    for (let answer of coming_answers) {
      await this.#storageSvc.query_interv(
        `UPDATE ${answer.id} MERGE {
          answer: ${answer.answer},
          question: ${answer.question},
        };`)
    }

    // new live
    (async () => {
      type RAnswer = { action: string; result: Answer }

      const papersSvc = this.#injector.get(PapersService)
      const stream: ReadableStreamDefaultReader<RAnswer> = (await this.#outer_db.live('answers')).getReader()

      while (true) {
        const { done, value } = await stream.read()
        const { action, result } = value

        switch (action) {
          case 'CLOSE': return ;
          case 'DELETE':

            await this.#storageSvc.query_interv(`DELETE ${result.id};`)
            break
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query_interv(
              `UPDATE ${result.id} MERGE {
                answer: ${result.answer},
                question: ${result.question},
              };`)

            break
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
        if (done) break
        // if (done || action === 'CLOSE') break
      }
    })()
  }

  async #live_papers() {
    let local_papers:  Paper[] = (await this.#storageSvc.query_interv(`SELECT * FROM papers;`))[0]
    let coming_papers: Paper[] = await this.#outer_db
      .select('papers')
      .then((tPapers: TPaper[]) => tPapers.map((paper: Paper) => {
        return {
          id: paper.id,
          user: paper.user,
          resource: paper.resource,
          completed: paper.completed,
          answers: paper.answers,
          created: paper.created,
        }
      }))

    // detect deletes
    for (let paper of local_papers) {
      if (!coming_papers.find(p => p.id === paper.id)) {
        await this.#storageSvc.query_interv(`DELETE ${paper.id};`)
      }
    }

    // detect updates
    for (let paper of coming_papers) {
      await this.#storageSvc.query_interv(
        `UPDATE ${paper.id} CONTENT {
          resource: ${paper.resource},
          user: ${paper.user},
          completed: ${paper.completed},
          answers: ${JSON.stringify(paper.answers)},
          created: ${JSON.stringify(paper.created)},
        };`)
    }

    // new live
    (async () => {
      type RPaper = { action: string; result: Paper }

      const papersSvc = this.#injector.get(PapersService)
      const stream: ReadableStreamDefaultReader<RPaper> = (await this.#outer_db.live('papers')).getReader()

      while (true) {
        const { done, value } = await stream.read()
        const { action, result } = value

        switch (action) {
          case 'CLOSE': return ;
          case 'DELETE':

            await this.#storageSvc.query_interv(`DELETE ${result.id};`)
            break
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query_interv(
              `UPDATE ${result.id} CONTENT {
                resource: ${result.resource},
                user: ${result.user},
                completed: ${result.completed},
                answers: ${JSON.stringify(result.answers)},
                created: ${JSON.stringify(result.created)},
              };`)

            break
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
        if (done) break
      }
    })()
  }

  async #live_scores() {
    let local_scores:  Score[] = (await this.#storageSvc.query_interv(`SELECT * FROM scores;`))[0]
    let coming_scores: Score[] = await this.#outer_db
      .select('scores')
      .then((tScores: TScore[]) => tScores.map((score: Score) => {
        return {
          id: score.id,
          user: score.user,
          score: JSON.stringify(score.score),
          created: score.created,
        }
      }))

    // detect deletes
    for (let score of local_scores) {
      if (!coming_scores.find(s => s.id === score.id)) {
        await this.#storageSvc.query_interv(`DELETE ${score.id};`)
      }
    }

    // detect updates
    for (let score of coming_scores) {
      await this.#storageSvc.query_interv(
        `UPDATE ${score.id} CONTENT {
          user: ${score.user},
          score: ${JSON.stringify(score.score)},
          created: ${JSON.stringify(score.created)},
        };`)
    }

    // new live
    (async () => {
      type RScore = { action: string; result: Score }

      const papersSvc = this.#injector.get(PapersService)
      const stream: ReadableStreamDefaultReader<RScore> = (await this.#outer_db.live('scores')).getReader()

      while (true) {
        const { done, value } = await stream.read()
        const { action, result } = value

        switch (action) {
          case 'CLOSE': return ;
          case 'DELETE':

            await this.#storageSvc.query_interv(`DELETE ${result.id};`)
            break
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query_interv(
              `UPDATE ${result.id} CONTENT {
                user: ${result.user},
                score: ${JSON.stringify(result.score)},
                created: ${JSON.stringify(result.created)},
              };`)

            break
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
        if (done) break
      }
    })()
  }
}
