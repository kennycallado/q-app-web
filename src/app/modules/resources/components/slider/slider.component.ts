import { SwiperContainer, register } from 'swiper/element'

import { Component, ElementRef, Signal, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { PapersService } from '../../../../providers/services/papers.service';

import { ResourceType } from '../../../../providers/models/resource.model';
import { PaperPush } from '../../../../providers/models/paper.model';
import { Answer } from '../../../../providers/models/answer.model';
import { Slide } from '../../../../providers/models/slide.model';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.sass'
})
export class SliderComponent {
  #router       = inject(Router)
  #route        = inject(ActivatedRoute)
  #papersSvc    = inject(PapersService)

  @ViewChild('swiper') swiper: ElementRef<SwiperContainer>;

  paper: WritableSignal<PaperPush>;

  allowSlideNext = true;
  allowSlidePrev = true;

  reachedEnd     = false;
  completed      = false;

  locale = 'es';

  change_answer(new_answer: CustomEvent<Answer>) {
    this.paper.update((paper) => {
      const answers = paper.answers;
      const answer = answers.find((answer) => answer.question === new_answer.detail.question)

      if (answer) {
        answer.answer = new_answer.detail.answer
        answers.push(answer)
      } else {
        answers.push(new_answer.detail)
      }

      paper.answers = answers

      return paper
    })

    // this.paper.update((paper) => {
    //   const answers = paper.answers;
    //   const answer = answers.find((answer) => answer.question === new_answer.detail.question)

    //   if (answer) {
    //     answer.answer = new_answer.detail.answer
    //   } else {
    //     paper.answers.push(new_answer.detail)
    //   }

    //   paper.answers = answers

    //   return paper
    // })

    if (this.check_completed()) this.completed = true
  }

  get_answer(question_id: string): Answer | undefined {
    if (this.paper().answers.length === 0) return undefined

    return this.paper().answers.find((answer) => answer.question === question_id)
  }

  // Slide[] | Question[]
  get_content(type: ResourceType): any {
    return this.paper().resource[type]
  }

  submit() {
    if (!this.check_completed()) return

    // enviar al service:
    // save answers locally
    // send answers to server
    // complete the paper with the answers
    // send the paper to the server

    this.#router.navigate(['resources'])
  }

  check_completed() {
    if (this.paper().resource.type === 'module') return true

    if (this.paper().resource.type === 'slides') {
      let n_questions = 0

      for (const slide of this.paper().resource.slides as Slide[]) {
        if (slide.type === 'input') n_questions++
      }

      if (this.paper().answers.length === n_questions) return true
    }

    if (this.paper().resource.type === 'form') {
      if (this.paper().answers.length === this.paper().resource.form.length) return true
    }

    return false
  }

  reachEnd() {
    // some times this method is called before the paper is loaded
    if (typeof this.paper !== "function") return ;
    console.log('reached end')
    if (this.check_completed()) this.completed = true

    this.reachedEnd = true;
  }

  next() {
    this.swiper.nativeElement.swiper.slideNext()
  }

  prev() {
    this.swiper.nativeElement.swiper.slidePrev()
  }

  // lifecycle hooks
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

  ngOnDestroy() {
    this.reachedEnd = false;
    this.completed  = false;
    this.paper.set(undefined)
  }
}
