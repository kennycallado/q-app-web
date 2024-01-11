import { Injectable, Injector, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { Surreal as SurrealJS } from 'surrealdb.js'

import { OUTER_DB } from '../../constants';
import { StorageService } from '../storage.service';
import { PapersService } from '../papers.service';

import { ContentEntity } from '../../types';
import { Media } from '../../models/media.model';
import { Question } from '../../models/question.model';
import { Slide } from '../../models/slide.model';
import { Resource } from '../../models/resource.model';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  #storageSvc = inject(StorageService)
  #injector   = inject(Injector) // very important to avoid circular dependencies
  #document   = inject(DOCUMENT)

  #outer_db = new SurrealJS()
  #db_url = this.#document.location.hostname === 'localhost' ? "ws://localhost:8000" : OUTER_DB

  #ready = signal(false)
  ready = computed(() => this.#ready())

  #update = effect(async () => {
    if (this.#storageSvc.ready !== undefined && this.#storageSvc.ready()) {
      // await this.#outer_db.connect(this.#db_url, undefined)
      // await this.#outer_db.use({ namespace: 'projects', database: 'demo' })

      // await this.#auth()

      // await this.#sync_locales()

      // await this.#live_media()
      // await this.#live_questions()
      // await this.#live_slides()
      // await this.#live_resources()

      this.#ready.set(true)
    }
  })

  async #auth() {
    await this.#outer_db.signin({ username: 'root', password: 'root' })
  }

  async #sync_locales() {
    let coming_locales = await this.#outer_db.select(ContentEntity.locales);

    for (let result of coming_locales) {
      await this.#storageSvc.query(ContentEntity.locales,
        `UPDATE ${result.id} CONTENT {
          locale: ${JSON.stringify(result.locale)},
        }`)
    }
  }

  async #live_media() {
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
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

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

        papersSvc.load()
      })
  }

  async #live_questions() {
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
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

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

        papersSvc.load()
      })
  }

  async #live_slides() {
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
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

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

        papersSvc.load()
      })
  }

  async #live_resources() {
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
      async ({ action, result }) => {
        const papersSvc = this.#injector.get(PapersService)

        switch (action) {
          case 'CLOSE': return;
          case 'DELETE':

            await this.#storageSvc.query(ContentEntity.resources, `DELETE ${result}`)

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

            break;
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
      })
  }
}
