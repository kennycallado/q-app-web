export class Media {
  id: string;
  alt?: string;
  url: string;
  type: MediaType;
}

export enum MediaType {
  Image = 'image',
  Video = 'video',
}
