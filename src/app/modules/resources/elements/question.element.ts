import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import { Question } from '../../../providers/models/question.model';
import { Answer } from '../../../providers/models/answer.model';

@customElement('question-element')
export class QuestionElement extends LitElement {
  static styles = css`
    p {
      margin-top: 0;
      font-size: 1.25rem;
      font-weight: 300;
    }

    .answer {
      color: #2196f3;
    }

    input {
      color: #2196f3;
      width: 100%;
      font-size: 1.25rem;
      font-weight: 300;
      border: none;
      border-bottom: 1px solid #2196f3;
      outline: none;
    }
  `;

  // Declare reactive properties
  @property()
  question: Question;

  @property()
  answer: Answer | undefined;

  @property()
  locale?: string = 'en';

  @property()
  private spellAnswer: string = '';

  // connectedCallback(): void {
  //   super.connectedCallback();

  //   if (!this.answer) { this.answer = new Answer() }

  //   this.spell(this.answer.answer)
  // }

  spell(answer: string) {
    let question = this.question.question.find((content) => content.locale === this.locale)
    this.spellAnswer = question.spelled[parseInt(answer) - 1] // start at 0 but min is 1
  }

  changes(event: HTMLInputElement) {
    this.answer.answer = event.value

    // maybe only for range
    this.spell(event.value)

    const options = {
      bubbles: true,
      composed: true,
      detail: this.answer
    }

    this.dispatchEvent(new CustomEvent('change', options))
  }

  get_value(): string {
    if (this.answer?.answer) return this.answer.answer
    if (this.question.type !== 'range') return ''
    if (this.question[this.question.type].value) return this.question[this.question.type].value.toString()

    return '0'
  }

  get_min(): string {
    if (this.question.type !== 'range') return ''
    if (this.question[this.question.type].min) return this.question[this.question.type].min.toString()

    return '1'
  }

  get_max(): string {
    if (this.question.type !== 'range') return ''
    if (this.question[this.question.type].max) return this.question[this.question.type].max.toString()

    return '7'
  }

  // Render the UI as a function of component state
  render() {
    if (!this.answer) {
      this.answer = new Answer()
      this.answer.question = this.question.id
    }

    const content = () => {
      let question: any;
      question = this.question.question.find((content) => content.locale === this.locale).content
      if (!question) question = this.question.question[0].content

      return question
    }

    return html`
      <p>${content()} <span class="answer">${this.spellAnswer}</span></p>

      <input
        @change="${(event: any) => this.changes(event.target)}"
        type="${this.question.type}"
        value="${this.get_value()}"
        min="${this.get_min()}"
        max="${this.get_max()}"
      />

      `;
  }
}
