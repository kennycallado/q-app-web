import { Component, Input } from '@angular/core';

import '@justinribeiro/lite-youtube';

import { DEFAULT_PICTURE_URL } from '../../../../providers/constants';
import { Media } from '../../../../providers/models/media.model';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.sass'
})
export class MediaComponent {
  @Input() media?: Media;

  private timeStamp: number = Date.now();
  private default_picture: string = DEFAULT_PICTURE_URL;

  get linkPicture(): string {
    return (this.media && this.media.type === 'image') ? this.media.url : `${this.default_picture}?${this.timeStamp}`;
  }
}
