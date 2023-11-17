import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

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
  question: string;

  @property()
  answer?: string = '';

  // Render the UI as a function of component state
  render() {
    return html`
<p>question: ${this.question}</p>
<p>answer: ${this.answer}</p>
`;
  }
}
