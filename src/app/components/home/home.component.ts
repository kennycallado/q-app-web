import { Component, inject } from '@angular/core';

import { ContentEntity, OutcomeEntity } from '../../providers/types';
import { StorageService } from '../../providers/services/storage.service';

import { Question } from '../../providers/models/question.model';
import { Media } from '../../providers/models/media.model';
import { Resource } from '../../providers/models/resource.model';
import { Slide } from '../../providers/models/slide.model';
import { Answer } from '../../providers/models/answer.model';
import { Paper } from '../../providers/models/paper.model';
import { Score } from '../../providers/models/score.model';
import { InterAuthService } from '../../providers/services/interventions/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {
  #storageSvc = inject(StorageService)
  #authSvc    = inject(InterAuthService)

  async blah() {
    console.log('blah')
    console.log(this.#authSvc.inter_token())
  }

  async getEso(entity: string) {
    let result: Promise<Array<Question | Media | Resource | Slide>>;

    switch (entity) {
      case ContentEntity.questions:
        result = this.#storageSvc.get<Question>(ContentEntity.questions)
        break;
      case ContentEntity.media:
        result = this.#storageSvc.get<Media>(ContentEntity.media)
        break;
      case ContentEntity.resources:
        result = this.#storageSvc.get<Resource>(ContentEntity.resources)
        break;
      case ContentEntity.slides:
        result = this.#storageSvc.get<Slide>(ContentEntity.slides)
        break;

      default:
        console.log('entity not defined')
        break;
    }

    console.log(await result)
  }

  async getEsto(entity: string) {
    let result: Promise<Array<Answer | Paper | Score>>

    switch (entity) {
      case OutcomeEntity.answers:
        result = this.#storageSvc.get<Answer>(OutcomeEntity.answers)
        break;
      case OutcomeEntity.papers:
        result = this.#storageSvc.get<Paper>(OutcomeEntity.papers)
        break;
      case OutcomeEntity.scores:
        result = this.#storageSvc.get<Score>(OutcomeEntity.scores)
        break;

      default:
        console.log('entity not defined')
        break;
    }

    console.log(await result)
  }
}
