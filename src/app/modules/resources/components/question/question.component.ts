import { WritableSignal, Component, Input, Output, EventEmitter, computed, effect, signal } from '@angular/core';

import { Question, RangeQuestion } from '../../../../providers/models/question.model'
import { Answer } from '../../../../providers/models/answer.model'

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrl: './question.component.sass'
})
export class QuestionComponent {
  @Input({ transform: (answer: Answer | undefined) => !answer ? signal(new Answer()) : signal(answer) }) answer: WritableSignal<Answer>
  @Input() question: Question
  @Input() locale: string

  @Output() change_answer: EventEmitter<Answer> = new EventEmitter<Answer>()

  content = computed(() => {
    const locale = this.locale ?? 'en'

    return this.question.question.find((content) => content.locale === locale)?.content
  })

  spelled = computed(() => {
    const question = this.question.question.find((content) => content.locale === this.locale)

    return question?.spelled[parseInt(this.answer().answer) - 1] ?? ''
  })

  update(event: HTMLInputElement) {
    this.answer.set({ ...this.answer(), question: this.question.id, answer: event.value })

    this.change_answer.emit(this.answer())
  }

  get_value(): string {
    return this.answer().answer ?? this.getRangeValue('value', '0')
  }

  get_min(): string {
    return this.getRangeValue('min', '1')
  }

  get_max(): string {
    return this.getRangeValue('max', '6')
  }

  private getRangeValue(key: keyof RangeQuestion, defaultValue: string): string {
    return this.question.type === 'range' ? this.question[this.question.type][key]?.toString() ?? defaultValue : ''
  }
}
