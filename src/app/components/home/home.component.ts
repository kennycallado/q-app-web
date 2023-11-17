import { Component, inject } from '@angular/core';
import { ContentService, ContentEntity } from '../../providers/services/content.service';
import { OutcomeService, OutcomeEntity } from '../../providers/services/outcome.service';

import { Question } from '../../providers/models/question.model';
import { Media } from '../../providers/models/media.model';
import { Resource } from '../../providers/models/resource.model';
import { Slide } from '../../providers/models/slide.model';
import { Answer } from '../../providers/models/answer.model';
import { Paper } from '../../providers/models/paper.model';
import { Record } from '../../providers/models/record.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {
  #contentSvc = inject(ContentService)
  #outcomeSvc = inject(OutcomeService)

  async getEso(entity: string) {
    let result: Promise<Array<Question | Media | Resource | Slide>>;

    switch (entity) {
      case 'questions':
        result = this.#contentSvc.get<Question>(ContentEntity.questions)
        break;
      case 'media':
        result = this.#contentSvc.get<Media>(ContentEntity.media)
        break;
      case 'resources':
        result = this.#contentSvc.get<Resource>(ContentEntity.resources)
        break;
      case 'slides':
        result = this.#contentSvc.get<Slide>(ContentEntity.slides)
        break;
      default:
        console.log('entity not defined')
        break;
    }

    console.log(await result)
  }

  async getEsto(entity: string) {
    let result: Promise<Array<Answer | Paper | Record>>

    // switch (entity) {
    //   case 'answers':
    //     result = this.#outcomeSvc.get<Answer>(OutcomeEntity.answers)
    //     break;
    //   case 'papers':
    //     result = this.#outcomeSvc.get<Paper>(OutcomeEntity.papers)
    //     break;
    //   case 'records':
    //     result = this.#outcomeSvc.get<Record>(OutcomeEntity.records)
    //     break;
    //   default:
    //     console.log('entity not defined')
    //     break;
    // }

    console.log(await result)
  }
}
