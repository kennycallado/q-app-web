import { Component, Input, ViewChild } from '@angular/core'

import { YouTubePlayer } from '@angular/youtube-player';

import { DEFAULT_PICTURE_URL } from '../../../../providers/constants';
import { Media } from '../../../../providers/models/media.model';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrl: './media.component.sass'
})
/**
 * MediaComponent is a component class in Angular. It is used to handle media content in the application.
 * It can handle both image and video content.
 *
 * @component
 * @example
 * <app-media [media]="mediaItem"></app-media>
 */
export class MediaComponent {
  /**
   * @property {Media} media - The media item to be displayed.
   */
  @Input() media?: Media;
  @ViewChild('player') private _player: YouTubePlayer;

  /**
   * @private
   * Timestamp used to prevent caching of the default picture.
   */
  private timeStamp: number = Date.now();
  private default_picture: string = DEFAULT_PICTURE_URL;

  /**
   * @returns {string}
   * The URL of the picture to be displayed. If the media type is image, it returns the media URL.
   * If the media type is not image, it returns the default picture URL with a timestamp query parameter to prevent caching.
   */
  get linkPicture(): string {
    return (this.media && this.media.type === 'image') ? this.media.url : `${this.default_picture}?${this.timeStamp}`;
  }

  /**
   * @returns {string}
   * The ID of the YouTube video to be played. If the media type is video, it extracts the video ID from the media URL.
   * If the media type is not video, it returns an empty string.
   */
  get linkVideo(): string {
    return (this.media && this.media.type === 'video') ? this.videoIdExtractor(this.media.url) : '';
  }

  togglePlayback(): void {
    if (this._player.getPlayerState() === 1) {
      this._player.pauseVideo();
    } else {
      this._player.playVideo();
    }
  }

  /**
   * @private
   * Extracts the video ID from a YouTube video URL.
   * @param {string} url - The YouTube video URL.
   * @returns {string} The extracted video ID.
   */
  private videoIdExtractor(url: string): string {
    const match = url.match(/v=([^&]+)/);

    return match ? match[1] : '';
  }

  /**
   * @private
   * Appends the youtube iframe script to the document.
   */
  private appendScript(): void {
    // https://developers.google.com/youtube/iframe_api_reference#Getting_Started
    const tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    tag.id = `youtube-script`;

    document.body.appendChild(tag);
  }

  ngOnInit(): void {
    if (this.media && this.media.type === 'video' && !document.getElementById('youtube-script')) {
      this.appendScript();
    }

    return;
  }
}