import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import { Media } from '../../../providers/models/media.model';

const DEFAULT_PICTURE_URL = 'https://picsum.photos/200/300';

@customElement('media-element')
export class MediaElement extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    img, youtube-player {
      border-radius: 10px;

      width: 100%;
      height: 100%;
      object-fit: cover;
    }`;

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

    return html`<img src='${this.getLinkPicture()}' alt="${alt()}" /> `;
  }
}
