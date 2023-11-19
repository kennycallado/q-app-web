import { register } from 'swiper/element'

import { Component, Signal, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { PapersService } from '../../../../providers/services/papers.service';

import { ResourceType } from '../../../../providers/models/resource.model';
import { Question } from '../../../../providers/models/question.model';
import { PaperPush } from '../../../../providers/models/paper.model';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.sass'
})
export class SliderComponent {
  #router       = inject(Router)
  #route        = inject(ActivatedRoute)
  #papersSvc    = inject(PapersService)

  paper: Signal<PaperPush>;

  allowSlideNext = true;
  allowSlidePrev = true;

  reachedEnd = false;
  completed = false;

  locale = 'es';

  get_answer(question_id: string): string {
    if (this.paper().answers.length === 0) return ''

    return this.paper().answers.find((answer) => answer.question === question_id).answer || ''
  }

  get_question(question: Question): string {
    // return question.question.filter((content) => content.locale === this.locale)[0].content
    return question.question.find((content) => content.locale === this.locale).content
  }

  // Slide[] | Question[]
  content(type: ResourceType): any {
    switch (type) {
      case ResourceType.Slides:
        return this.paper().resource.slides
      case ResourceType.Module:
        return this.paper().resource.module
      case ResourceType.Form:
        return this.paper().resource.form
      default:
        break;
    }
  }

  submit() {
    this.#router.navigate(['slider'])
  }

  reachEnd() {
    if (!this.paper()) return ;
    // if (this.checkCompleted()) this.completed = true

    this.reachedEnd = true;
  }

  next(text: string) {
    if (!text) return ; // prevent double execution
  }

  prev(text: string) {
    if (!text) return ; // prevent double execution
  }

  ngOnInit() {
    this.#route.paramMap.subscribe((params: ParamMap) => {
      const paper_id = params.get('paper_id')

      this.paper = signal(
        this.#papersSvc
          .papers()
          .find(paper => paper.id === paper_id) as PaperPush)
    })
  }

  ngAfterViewInit() {
    register()
  }
}
