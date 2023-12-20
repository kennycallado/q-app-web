import { Component, ElementRef, Input, ViewChild } from '@angular/core'

import { YouTubePlayer } from '@angular/youtube-player';

import { DEFAULT_PICTURE_URL } from '../../../../providers/constants';
import { Media } from '../../../../providers/models/media.model';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.sass'
})
export class MediaComponent {
  @Input() media?: Media;
  @ViewChild('player') player: YouTubePlayer;

  private timeStamp: number = Date.now();
  private default_picture: string = DEFAULT_PICTURE_URL;

  get linkPicture(): string {
    return (this.media && this.media.type === 'image') ? this.media.url : `${this.default_picture}?${this.timeStamp}`;
  }

  get linkVideo(): string {
    return (this.media && this.media.type === 'video') ? this.videoIdExtractor(this.media.url) : '';
  }

  togglePlayback(): void {
    if (this.player.getPlayerState() === 1) {
      this.player.pauseVideo();
    } else {
      this.player.playVideo();
    }
  }

  private videoIdExtractor(url: string): string {
    const videoId = url.split('v=')[1];

    return videoId ? videoId.split('&')[0] : '';
  }

  ngOnInit(): void {
    // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
    if (this.media && this.media.type === 'video' && !document.getElementById('youtube-script')) {
      const tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      tag.id = `youtube-script`;

      document.body.appendChild(tag);
    }

    return ;
  }
}
