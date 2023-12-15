import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { Question } from '../../../providers/models/question.model'
import { Answer } from '../../../providers/models/answer.model'

@customElement('question-element')
export class QuestionElement extends LitElement {

  @property({ type: Object }) answer: Answer
  @property({ type: Object }) question: Question
  @property({ type: String }) locale? = 'en'
  @property({ state: true, type: String }) content = ''
  @property({ state: true, type: String }) spellAnswer: string

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

  updated(changedProperties) {
    if (changedProperties.has('question')) {
      if (!this.answer) this.answer = new Answer(this.question.id)
      else this.answer.question = this.question.id;

      this.updateContent();
    }

    // if (changedProperties.has('locale')) {
    //   this.updateContent();
    // }
  }

  updateContent() {
    this.content = this.question.question.find((content) => content.locale === this.locale)?.content || this.question.question[0].content;
  }

  handleChange(event: Event) {
    console.log('handleChange')
    // const target = event.target as HTMLInputElement;
    // this.changes(target);
  }

  render() {
    return html`
      <p>${this.content} <span class="answer">${this.spellAnswer}</span></p>

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
