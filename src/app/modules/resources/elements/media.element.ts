import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@justinribeiro/lite-youtube';

import { DEFAULT_PICTURE_URL } from '../../../providers/constants';
import { Media } from '../../../providers/models/media.model';

@customElement('media-element')
export class MediaElement extends LitElement {
  @property({ type: Object }) media?: Media;

  private timeStamp: number = Date.now();
  private default_picture: string = DEFAULT_PICTURE_URL;

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

  get linkPicture(): string {
    return (this.media && this.media.type === 'image') ? this.media.url : `${this.default_picture}?${this.timeStamp}`;
  }

  render() {
    return (this.media && this.media.type === 'video')
      ? html`<lite-youtube videoid="FoMlSB6ftQg" alt="${this.media?.alt ?? ''}" params="controls=0"></lite-youtube>`
      : html`<img src='${this.linkPicture}' alt="${this.media?.alt ?? ''}" /> `;
  }
}
