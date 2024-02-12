import { SwiperContainer, register } from 'swiper/element'

import { Component, ElementRef, ViewChild, WritableSignal, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { PapersService } from '../../../../providers/services/papers.service';

import { ResourceType } from '../../../../providers/models/resource.model';
import { PaperWithResource } from '../../../../providers/models/paper.model';
import { Answer } from '../../../../providers/models/answer.model';
import { Slide } from '../../../../providers/models/slide.model';
import { Question } from '../../../../providers/models/question.model';

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

  ready          = false;

  allowSlideNext = true;
  allowSlidePrev = true;

  reachedEnd     = false;
  completed      = false;

  // should come from the user
  locale = 'es';

  paper: WritableSignal<PaperWithResource>;
  p_ready = effect(() => {
    if (this.ready) return
    if (this.#papersSvc.papers() !== undefined && this.#papersSvc.papers().length > 0) {
      this.#route.paramMap.subscribe((params: ParamMap) => {
        const paper_id = params.get('paper_id')

        const paper = this.#papersSvc.papers().find(paper => paper.id === paper_id)
        this.paper = signal(paper)

        if (this.paper()) this.ready = true
      })
    }
  })

  get_answer(question_id: string): Answer | undefined {
    if (this.paper().answers.length === 0) return undefined

    return this.paper().answers.find((answer) => answer.question === question_id)
  }

  get_content(type: ResourceType): Slide[] | Question[] {
    return this.paper().resource[type]
  }

  change_answer(new_answer: Answer): void {
    if (new_answer.user === undefined) new_answer.user = this.paper().user;

    this.paper.update((paper) => {
      let index = paper.answers.findIndex((answer) => answer.question === new_answer.question)

      if (index === -1) {
        paper.answers = [...paper.answers, new_answer]
      } else {
        paper.answers[index] = new_answer
      }

      return paper
    })

    this.completed = this.check_completed()
  }

  reachEnd(): void {
    // not sure why
    if (!this.swiper) return
    this.completed = this.check_completed()

    this.reachedEnd = true;
  }

  private check_completed(): boolean {
    if (this.paper().resource.type === 'module') return true

    if (this.paper().resource.type === 'slides') {
      let n_questions = 0

      for (const slide of this.paper().resource.slides as Slide[]) {
        if (slide.type === 'input') n_questions++
      }

      if (this.paper().answers.length === n_questions) return true
      return false
    }

    if (this.paper().resource.type === 'form') {
      if (this.paper().answers.length === this.paper().resource.form.length) return true
    }

    return false
  }

  next(): void {
    this.swiper.nativeElement.swiper.slideNext()
  }

  prev(): void {
    this.swiper.nativeElement.swiper.slidePrev()
  }

  submit(): void {
    if (!this.check_completed()) return

    this.#papersSvc.update(this.paper())

    // enviar al service:
    // save answers locally
    // send answers to server
    // complete the paper with the answers
    // send the paper to the server

    this.#router.navigate(['resources'])
  }

  ngAfterViewInit(): void {
    register()
  }
}
