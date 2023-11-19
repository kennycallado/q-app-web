import { Component, Input } from '@angular/core';
import { Media, MediaType } from '../../../../providers/models/media.model';
import { DEFAULT_PICTURE_URL } from '../../../../providers/constants';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.sass'
})
export class MediaComponent {
  @Input() media?: Media;

  timeStamp: number = Date.now();
  default_picture: string = DEFAULT_PICTURE_URL;

  getLinkPicture(): string {
    if (this.media && this.media.type === 'image') {
      return this.media.url;
    }

    return this.default_picture + '?' + this.timeStamp;
  }

  ngOnInit(): void {
    // Este código carga el reproductor de la API en un iframe de manera asíncrona, siguiendo las instrucciones:
    // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
    if (!this.media) this.media = { id: "media:0", url: this.getLinkPicture(), type: MediaType.Image }

    if (this.media.type === 'video') {
      const tag = document.createElement('script');
      // create a id to be able to paly one by one

      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    return;
  }
}
