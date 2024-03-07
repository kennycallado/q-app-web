import { Injectable, Injector, computed, effect, inject, signal } from '@angular/core'
import { DOCUMENT } from '@angular/common'

import { Surreal } from 'surrealdb/lib/full.js'

import { StorageService } from '../storage.service'
import { PapersService } from '../papers.service'
import { IntervAuthService } from '../interventions/auth.service'

import { OUTER_DB } from '../../constants'
import { Question, TQuestion } from '../../models/question.model'
import { Resource, TResource } from '../../models/resource.model'
import { Media, TMedia } from '../../models/media.model'
import { Slide, TSlide } from '../../models/slide.model'

@Injectable({
  providedIn: 'root'
})
export class ContentService {
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

        // sync locales table
        await this.#sync_locales()

        // init live queries
        await this.#live_media()
        await this.#live_questions()
        await this.#live_slides()
        await this.#live_resources()
      }

      this.#ready.set(true)
    }
  })

  async #sync_locales() { // has no types
    let coming_locales = await this.#outer_db.select('locales')

    for (let result of coming_locales) {
      await this.#storageSvc.query_interv(
        `UPDATE ${result.id} CONTENT {
          locale: ${JSON.stringify(result.locale)},
        };`)
    }
  }

  async #live_media() {
    let local_media:  Media[] = (await this.#storageSvc.query_interv(`SELECT * FROM media;`))[0]
    let coming_media: Media[] = await this.#outer_db
      .select('media')
      .then((tMedia: TMedia[]) => tMedia.map((media: Media) => {
        return {
          id: media.id,
          alt: media.alt,
          type: media.type,
          url: media.url
        }
      }))

    // detect deletes
    for (let media of local_media) {
      if (!coming_media.find(m => m.id === media.id)) {
        await this.#storageSvc.query_interv(`DELETE ${media.id};`)
      }
    }

    // detect updates
    for (let media of coming_media) {
      await this.#storageSvc.query_interv(
        `UPDATE ${media.id} CONTENT {
          type: ${JSON.stringify(media.type)},
          alt:  ${JSON.stringify(media.alt)},
          url:  ${JSON.stringify(media.url)},
        };`)
    }

    // new live
    (async () => {
      type RMedia = { action: string; result: Media }

      const papersSvc = this.#injector.get(PapersService)
      const stream: ReadableStreamDefaultReader<RMedia> = (await this.#outer_db.live('media')).getReader()

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
                alt: ${JSON.stringify(result.alt)},
                type: ${JSON.stringify(result.type)},
                url: ${JSON.stringify(result.url)},
              };`)

            break
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
        if (done || action === 'CLOSE') break
      }
    })()

  }

  async #live_questions() {
    let local_questions:  Question[] = (await this.#storageSvc.query_interv(`SELECT * FROM questions;`))[0]
    let coming_questions: Question[] = await this.#outer_db
      .select('questions')
      .then((tQuestions: TQuestion[]) => tQuestions.map((question: Question) => {
        return {
          id: question.id,
          type: question.type,
          range: question.range,
          question: question.question
        }
      }))

    // detect deletes
    for (let question of local_questions) {
      if (!coming_questions.find(q => q.id === question.id)) {
        await this.#storageSvc.query_interv(`DELETE ${question.id};`)
      }
    }

    // detect updates
    for (let question of coming_questions) {
      await this.#storageSvc.query_interv(
        `UPDATE ${question.id} CONTENT {
          type: ${JSON.stringify(question.type)},
          range: ${JSON.stringify(question.range)},
          question: ${JSON.stringify(question.question)},
        };`)
    }

    // new live
    (async () => {
      type RQuestion = { action: string; result: Question }

      const papersSvc = this.#injector.get(PapersService)
      const stream: ReadableStreamDefaultReader<RQuestion> = (await this.#outer_db.live('questions')).getReader()

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
                type: ${JSON.stringify(result.type)},
                range: ${JSON.stringify(result.range)},
                question: ${JSON.stringify(result.question)},
              };`)

            break
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
        if (done || action === 'CLOSE') break
      }
    })()
  }

  async #live_slides() {
    let local_slides:  Slide[] = (await this.#storageSvc.query_interv(`SELECT * FROM slides;`))[0]
    let coming_slides: Slide[] = await this.#outer_db
      .select('slides')
      .then((tSlides: TSlide[]) => tSlides.map((slide: Slide) => {
        return {
          id: slide.id,
          title: slide.title,
          content: slide.content,
          media: slide.media,
          type: slide.type,
          question: slide.question
        }
      }))

    // detect deletes
    for (let slide of local_slides) {
      if (!coming_slides.find(s => s.id === slide.id)) {
        await this.#storageSvc.query_interv(`DELETE ${slide.id};`)
      }
    }

    // detect updates
    for (let slide of coming_slides) {
      await this.#storageSvc.query_interv(
        `UPDATE ${slide.id} CONTENT {
          title: ${JSON.stringify(slide.title)},
          content: ${JSON.stringify(slide.content)},
          media: ${JSON.stringify(slide.media)},
          type: ${JSON.stringify(slide.type)},
          question: ${JSON.stringify(slide.question)},
        };`)
    }

    // new live
    (async () => {
      type RSlide = { action: string; result: Slide }

      const papersSvc = this.#injector.get(PapersService)
      const stream: ReadableStreamDefaultReader<RSlide> = (await this.#outer_db.live('slides')).getReader()

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
                title: ${JSON.stringify(result.title)},
                content: ${JSON.stringify(result.content)},
                media: ${JSON.stringify(result.media)},
                type: ${JSON.stringify(result.type)},
                question: ${JSON.stringify(result.question)},
              };`)

            break
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
        if (done || action === 'CLOSE') break
      }
    })()
  }

  async #live_resources() {
    let local_resources:  Resource[] = (await this.#storageSvc.query_interv(`SELECT * FROM resources;`))[0]
    let coming_resources: Resource[] = await this.#outer_db
      .select('resources')
      .then((tResources: TResource[]) => tResources.map((resource: Resource) => {
        return {
          id: resource.id,
          ref: resource.ref,
          description: resource.description,
          title: resource.title,
          type: resource.type,
          form: resource.form,
          module: resource.module,
          slides: resource.slides
        }
      }))

    // detect deletes
    for (let resource of local_resources) {
      if (!coming_resources.find(r => r.id === resource.id)) {
        await this.#storageSvc.query_interv(`DELETE ${resource.id};`)
      }
    }

    // detect updates
    for (let resource of coming_resources) {
      await this.#storageSvc.query_interv(
        `UPDATE ${resource.id} CONTENT {
          ref: ${JSON.stringify(resource.ref)},
          description: ${JSON.stringify(resource.description)},
          title: ${JSON.stringify(resource.title)},
          type: ${JSON.stringify(resource.type)},
          form: ${JSON.stringify(resource.form)},
          module: ${JSON.stringify(resource.module)},
          slides: ${JSON.stringify(resource.slides)},
        };`)
    }

    // new live
    (async () => {
      type RResource = { action: string; result: Resource }

      const papersSvc = this.#injector.get(PapersService)
      const stream: ReadableStreamDefaultReader<RResource> = (await this.#outer_db.live('resources')).getReader()

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
                ref: ${JSON.stringify(result.ref)},
                description: ${JSON.stringify(result.description)},
                title: ${JSON.stringify(result.title)},
                type: ${JSON.stringify(result.type)},
                form: ${JSON.stringify(result.form)},
                module: ${JSON.stringify(result.module)},
                slides: ${JSON.stringify(result.slides)},
              };`)
            break
          default:
            console.log('unknown action', action)
        }

        papersSvc.load()
        if (done || action === 'CLOSE') break
      }
    })()
  }


  // async #live_media() {
  //   // get both media
  //   let coming_media = await this.#outer_db.select<TMedia>('media')
  //   let local_media  = await this.#storageSvc.query_interv<Media>(`SELECT * FROM media;`)

  //   // detect deletes
  //   for (let media of local_media) {
  //     if (!coming_media.find(m => m.id === media.id)) {
  //       await this.#storageSvc.query_interv<Media>(`DELETE ${media.id};`)
  //     }
  //   }

  //   // detect updates
  //   for (let result of coming_media) {
  //     await this.#storageSvc.query_interv<Media>(
  //       `UPDATE ${result.id} CONTENT {
  //         alt: ${JSON.stringify(result.alt)},
  //         type: ${JSON.stringify(result.type)},
  //         url: ${JSON.stringify(result.url)},
  //       };`)
  //   }

  //   // live
  //   await this.#outer_db.live('media',
  //     async ({ action, result }) => {
  //       const papersSvc = this.#injector.get(PapersService)

  //       switch (action) {
  //         case 'CLOSE': return;
  //         case 'DELETE':

  //           await this.#storageSvc.query_interv<Media>(`DELETE ${result.id};`)
  //           break;
  //         case 'CREATE':
  //         case 'UPDATE':

  //           await this.#storageSvc.query_interv<Media>(
  //             `UPDATE ${result.id} CONTENT {
  //               alt: ${JSON.stringify(result.alt)},
  //               type: ${JSON.stringify(result.type)},
  //               url: ${JSON.stringify(result.url)},
  //             };`)

  //           break;
  //         default:
  //           console.log('unknown action', action)
  //       }

  //       papersSvc.load()
  //     })
  // }

  // async #live_questions() {
  //   // get both questions
  //   let coming_questions = await this.#outer_db.select<TQuestion>('questions')
  //   let local_questions  = await this.#storageSvc.query_interv<Question>(`SELECT * FROM questions;`)

  //   // detect deletes
  //   for (let question of local_questions) {
  //     if (!coming_questions.find(q => q.id === question.id)) {
  //       await this.#storageSvc.query_interv<Question>(`DELETE ${question.id};`)
  //     }
  //   }

  //   // detect updates
  //   for (let result of coming_questions) {
  //     await this.#storageSvc.query_interv<Question>(
  //       `UPDATE ${result.id} CONTENT {
  //         type: ${JSON.stringify(result.type)},
  //         range: ${JSON.stringify(result.range)},
  //         question: ${JSON.stringify(result.question)},
  //       };`)
  //   }

  //   // live
  //   await this.#outer_db.live('questions',
  //     async ({ action, result }) => {
  //       const papersSvc = this.#injector.get(PapersService)

  //       switch (action) {
  //         case 'CLOSE': return;
  //         case 'DELETE':

  //           await this.#storageSvc.query_interv<Question>(`DELETE ${result.id};`)
  //           break;
  //         case 'CREATE':
  //         case 'UPDATE':

  //           await this.#storageSvc.query_interv<Question>(
  //             `UPDATE ${result.id} CONTENT {
  //               type: ${JSON.stringify(result.type)},
  //               range: ${JSON.stringify(result.range)},
  //               question: ${JSON.stringify(result.question)},
  //             };`)

  //           break;
  //         default:
  //           console.log('unknown action', action)
  //       }

  //       papersSvc.load()
  //     })
  // }

  // async #live_slides() {
  //   // get both slides
  //   let coming_slides = await this.#outer_db.select<TSlide>('slides')
  //   let local_slides  = await this.#storageSvc.query_interv<Slide>(`SELECT * FROM slides;`)

  //   // detect deletes
  //   for (let slide of local_slides) {
  //     if (!coming_slides.find(s => s.id === slide.id)) {
  //       await this.#storageSvc.query_interv<Slide>(`DELETE ${slide.id};`)
  //     }
  //   }

  //   // detect updates
  //   for (let result of coming_slides) {
  //     await this.#storageSvc.query_interv<Slide>(
  //       `UPDATE ${result.id} CONTENT {
  //         title: ${JSON.stringify(result.title)},
  //         content: ${JSON.stringify(result.content)},
  //         media: ${JSON.stringify(result.media)},
  //         type: ${JSON.stringify(result.type)},
  //         question: ${JSON.stringify(result.question)},
  //       };`)
  //   }

  //   // live
  //   await this.#outer_db.live('slides',
  //     async ({ action, result }) => {
  //       const papersSvc = this.#injector.get(PapersService)

  //       switch (action) {
  //         case 'CLOSE': return;
  //         case 'DELETE':

  //           await this.#storageSvc.query_interv<Slide>(`DELETE ${result.id};`)
  //           break;
  //         case 'CREATE':
  //         case 'UPDATE':

  //           await this.#storageSvc.query_interv<Slide>(
  //             `UPDATE ${result.id} CONTENT {
  //               title: ${JSON.stringify(result.title)},
  //               content: ${JSON.stringify(result.content)},
  //               media: ${JSON.stringify(result.media)},
  //               type: ${JSON.stringify(result.type)},
  //               question: ${JSON.stringify(result.question)},
  //             };`)

  //           break;
  //         default:
  //           console.log('unknown action', action)
  //       }

  //       papersSvc.load()
  //     })
  // }

  // async #live_resources() {
  //   // get both resources
  //   let coming_resources = await this.#outer_db.select<TResource>('resources')
  //   let local_resources = await this.#storageSvc.query_interv<Resource>(`SELECT * FROM resources;`)

  //   // detect deletes
  //   for (let resource of local_resources) {
  //     if (!coming_resources.find(r => r.id === resource.id)) {
  //       await this.#storageSvc.query_interv(`DELETE ${resource.id};`)
  //     }
  //   }

  //   // detect updates
  //   for (let result of coming_resources) {
  //     await this.#storageSvc.query_interv<Resource>(
  //       `UPDATE ${result.id} CONTENT {
  //         ref: ${JSON.stringify(result.ref)},
  //         description: ${JSON.stringify(result.description)},
  //         title: ${JSON.stringify(result.title)},
  //         type: ${JSON.stringify(result.type)},
  //         form: ${JSON.stringify(result.form)},
  //         module: ${JSON.stringify(result.module)},
  //         slides: ${JSON.stringify(result.slides)},
  //       };`)
  //   }

  //   // live
  //   await this.#outer_db.live('resources',
  //     async ({ action, result }) => {
  //       const papersSvc = this.#injector.get(PapersService)

  //       switch (action) {
  //         case 'CLOSE': return;
  //         case 'DELETE':

  //           await this.#storageSvc.query_interv(`DELETE ${result.id};`)

  //           break;
  //         case 'CREATE':
  //         case 'UPDATE':

  //           await this.#storageSvc.query_interv<Resource>(
  //             `UPDATE ${result.id} CONTENT {
  //               ref: ${JSON.stringify(result.ref)},
  //               description: ${JSON.stringify(result.description)},
  //               title: ${JSON.stringify(result.title)},
  //               type: ${JSON.stringify(result.type)},
  //               form: ${JSON.stringify(result.form)},
  //               module: ${JSON.stringify(result.module)},
  //               slides: ${JSON.stringify(result.slides)},
  //             };`)

  //           break;
  //         default:
  //           console.log('unknown action', action)
  //       }

  //       papersSvc.load()
  //     })
  // }
}
