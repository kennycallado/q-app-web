import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Media } from '../../../providers/models/media.model';
import '@justinribeiro/lite-youtube';

const DEFAULT_PICTURE_URL = 'https://picsum.photos/200/300';

@customElement('media-element')
export class MediaElement extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    lite-youtube {
      width: 100%
    }
`;

  // Declare reactive properties
  @property()
  media?: Media;

  timeStamp: number = Date.now();
  default_picture: string = DEFAULT_PICTURE_URL;

  getLinkPicture(): string {
    if (this.media && this.media.type === 'image') {
      return this.media.url;
    }

    return this.default_picture + '?' + this.timeStamp;
  }

  // Render the UI as a function of component state
  render() {
    const alt = () => { return this.media?.alt ? this.media.alt : '' };

    return (this.media && this.media.type === 'video')
      ? html`<lite-youtube videoid="FoMlSB6ftQg" alt="${alt()}" params="controls=0"></lite-youtube>`
      : html`<img src='${this.getLinkPicture()}' alt="${alt()}" /> `;
    // return html`<img src='${this.getLinkPicture()}' alt="${alt()}" /> `;
  }
}
