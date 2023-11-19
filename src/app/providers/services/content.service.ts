import { Injectable, inject, isDevMode } from '@angular/core';

import { Surreal as SurrealJS } from 'surrealdb.js'

import { OUTER_DB } from '../constants';
import { StorageService } from './storage.service';
import { PapersService } from './papers.service';

import { Media } from '../models/media.model';
import { Question } from '../models/question.model';
import { Slide } from '../models/slide.model';
import { Resource } from '../models/resource.model';

export enum ContentEntity {
  locales = 'locales',
  media = 'media',
  questions = 'questions',
  resources = 'resources',
  slides = 'slides',
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  #storageSvc   = inject(StorageService)
  #papersSvc    = inject(PapersService)

  #outer_db = new SurrealJS()
  // #db_url = !isDevMode() ? OUTER_DB : "ws://localhost:8080"
  #db_url = "ws://localhost:8080"

  constructor() {
    (async () => {
      await this.#outer_db.connect(this.#db_url)
      await this.#outer_db.signin({ username: 'viewer', password: 'viewer', namespace: 'test' })

      await this.sync_locales()

      await this.live_media()
      await this.live_questions()
      await this.live_slides()
      await this.live_resources()
    })()
  }

  async sync_locales() {
    await this.#outer_db.use({ namespace: 'test', database: 'content' })

    let coming_locales = await this.#outer_db.select(ContentEntity.locales);
    for (let result of coming_locales) {
      await this.#storageSvc.query(ContentEntity.locales,
        `UPDATE ${result.id} CONTENT {
          locale: ${JSON.stringify(result.locale)},
        }`)
    }
  }

  private async live_media() {
    await this.#outer_db.use({ namespace: 'test', database: 'content' })

    // get both media
    let coming_media = await this.#outer_db.select(ContentEntity.media);
    let local_media = await this.#storageSvc.get<Media>(ContentEntity.media);

    // detect deletes
    for (let media of local_media) {
      if (!coming_media.find(m => m.id === media.id)) {
        await this.#storageSvc.query(ContentEntity.media, `DELETE ${media.id}`);
      }
    }

    // detect updates
    for (let result of coming_media) {
      await this.#storageSvc.query(ContentEntity.media,
        `UPDATE ${result.id} CONTENT {
          alt: ${JSON.stringify(result.alt)},
          type: ${JSON.stringify(result.type)},
          url: ${JSON.stringify(result.url)},
        }`)
    }

    // live
    await this.#outer_db.live('media',
      async ({action, result}) => {
        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query(ContentEntity.media, `DELETE ${result}`)
            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query(ContentEntity.media,
              `UPDATE ${result.id} CONTENT {
                alt: ${JSON.stringify(result.alt)},
                type: ${JSON.stringify(result.type)},
                url: ${JSON.stringify(result.url)},
              }`)

            break;
          default:
            console.log('unknown action', action)
        }
      })
  }

  private async live_questions() {
    await this.#outer_db.use({ namespace: 'test', database: 'content' })

    // get both questions
    let coming_questions = await this.#outer_db.select(ContentEntity.questions);
    let local_questions = await this.#storageSvc.get<Question>(ContentEntity.questions);

    // detect deletes
    for (let question of local_questions) {
      if (!coming_questions.find(q => q.id === question.id)) {
        await this.#storageSvc.query(ContentEntity.questions, `DELETE ${question.id}`);
      }
    }

    // detect updates
    for (let result of coming_questions) {
      await this.#storageSvc.query(ContentEntity.questions,
        `UPDATE ${result.id} CONTENT {
          type: ${JSON.stringify(result.type)},
          range: ${JSON.stringify(result.range)},
          question: ${JSON.stringify(result.question)},
        }`)
    }

    // live
    await this.#outer_db.live('questions',
      async ({action, result}) => {
        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query(ContentEntity.questions, `DELETE ${result}`)
            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query(ContentEntity.questions,
              `UPDATE ${result.id} CONTENT {
                type: ${JSON.stringify(result.type)},
                range: ${JSON.stringify(result.range)},
                question: ${JSON.stringify(result.question)},
              }`)

            break;
          default:
            console.log('unknown action', action)
        }
      });
  }

  private async live_slides() {
    await this.#outer_db.use({ namespace: 'test', database: 'content' })

    // get both slides
    let coming_slides = await this.#outer_db.select(ContentEntity.slides);
    let local_slides = await this.#storageSvc.get<Slide>(ContentEntity.slides);

    // detect deletes
    for (let slide of local_slides) {
      if (!coming_slides.find(s => s.id === slide.id)) {
        await this.#storageSvc.query(ContentEntity.slides, `DELETE ${slide.id}`);
      }
    }

    // detect updates
    for (let result of coming_slides) {
      await this.#storageSvc.query(ContentEntity.slides,
        `UPDATE ${result.id} CONTENT {
          title: ${JSON.stringify(result.title)},
          content: ${JSON.stringify(result.content)},
          media: ${JSON.stringify(result.media)},
          type: ${JSON.stringify(result.type)},
          question: ${JSON.stringify(result.question)},
        }`)
    }

    // live
    await this.#outer_db.live('slides',
      async ({action, result}) => {
        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query(ContentEntity.slides, `DELETE ${result}`)
            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query(ContentEntity.slides,
              `UPDATE ${result.id} CONTENT {
                title: ${JSON.stringify(result.title)},
                content: ${JSON.stringify(result.content)},
                media: ${JSON.stringify(result.media)},
                type: ${JSON.stringify(result.type)},
                question: ${JSON.stringify(result.question)},
              }`)

            break;
          default:
            console.log('unknown action', action)
        }
      });
  }

  private async live_resources() {
    await this.#outer_db.use({ namespace: 'test', database: 'content' })

    // get both resources
    let coming_resources = await this.#outer_db.select(ContentEntity.resources);
    let local_resources = await this.#storageSvc.get<Resource>(ContentEntity.resources);

    // detect deletes
    for (let resource of local_resources) {
      if (!coming_resources.find(r => r.id === resource.id)) {
        await this.#storageSvc.query(ContentEntity.resources, `DELETE ${resource.id}`);
      }
    }

    // detect updates
    for (let result of coming_resources) {
      await this.#storageSvc.query(ContentEntity.resources,
        `UPDATE ${result.id} CONTENT {
          ref: ${JSON.stringify(result.ref)},
          description: ${JSON.stringify(result.description)},
          title: ${JSON.stringify(result.title)},
          type: ${JSON.stringify(result.type)},
          form: ${JSON.stringify(result.form)},
          module: ${JSON.stringify(result.module)},
          slides: ${JSON.stringify(result.slides)},
        }`)
    }

    // live
    await this.#outer_db.live('resources',
      async ({action, result}) => {
        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query(ContentEntity.resources, `DELETE ${result}`)

            // reload resources
            // this.#resourcesSvc.load()
            this.#papersSvc.load()

            break;
          case 'CREATE':
          case 'UPDATE':

            await this.#storageSvc.query(ContentEntity.resources,
              `UPDATE ${result.id} CONTENT {
                ref: ${JSON.stringify(result.ref)},
                description: ${JSON.stringify(result.description)},
                title: ${JSON.stringify(result.title)},
                type: ${JSON.stringify(result.type)},
                form: ${JSON.stringify(result.form)},
                module: ${JSON.stringify(result.module)},
                slides: ${JSON.stringify(result.slides)},
              }`)

            // reload resources
            // this.#resourcesSvc.load()
            this.#papersSvc.load()

            break;
          default:
            console.log('unknown action', action)
        }
      });
  }
}
