export class Media {
  id: string;
  alt?: string;
  type: MediaType;
  url: string;
}

export enum MediaType {
  Image = 'image',
  Video = 'video',
}
