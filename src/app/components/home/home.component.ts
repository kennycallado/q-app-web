import { Component, inject } from '@angular/core';

import { ContentEntity, ContentService } from '../../providers/services/content.service';
import { OutcomeEntity, OutcomeService } from '../../providers/services/outcome.service';
import { StorageService } from '../../providers/services/storage.service';

import { Question } from '../../providers/models/question.model';
import { Media } from '../../providers/models/media.model';
import { Resource } from '../../providers/models/resource.model';
import { Slide } from '../../providers/models/slide.model';
import { Answer } from '../../providers/models/answer.model';
import { Paper } from '../../providers/models/paper.model';
import { Record as Score } from '../../providers/models/record.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {
  #storageSvc = inject(StorageService)

  #outcomeSvc = inject(OutcomeService)
  #contentSvc = inject(ContentService)

  async getEso(entity: string) {
    let result: Promise<Array<Question | Media | Resource | Slide>>;

    switch (entity) {
      case 'questions':
        result = this.#storageSvc.get<Question>(ContentEntity.questions)
        break;
      case 'media':
        result = this.#storageSvc.get<Media>(ContentEntity.media)
        break;
      case 'resources':
        result = this.#storageSvc.get<Resource>(ContentEntity.resources)
        break;
      case 'slides':
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
      case 'answers':
        result = this.#storageSvc.get<Answer>(OutcomeEntity.answers)
        break;
      case 'papers':
        result = this.#storageSvc.get<Paper>(OutcomeEntity.papers)
        break;
      case 'records':
        result = this.#storageSvc.get<Score>(OutcomeEntity.records)
        break;
      default:
        console.log('entity not defined')
        break;
    }

    console.log(await result)
  }


  async blah() {
    this.#outcomeSvc.live_papers()
  }

}
