import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Question } from '../../../providers/models/question.model';

@customElement('question-element')
export class QuestionElement extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    :host {
      color: blue;
    }
  `;

  // Declare reactive properties
  @property()
  question: Question;

  @property()
  answer?: string = '';

  @property()
  locale?: string = 'en';

  // Render the UI as a function of component state
  render() {
    return html`
      <p>question: ${this.question.question.find((content) => content.locale === this.locale).content}</p>
      <p>answer: ${this.answer}</p>
    `;
  }
}
