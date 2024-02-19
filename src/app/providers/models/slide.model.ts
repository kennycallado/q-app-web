import { Media } from "./media.model";
import { Question } from "./question.model";

export type TSlide = {
  id: string;
  title: string;
  content?: string;
  media?: Media;
  type: SlideType;
  question?: string | Question;
}

export class Slide {
  id: string;
  title: string;
  content?: string;
  media?: Media;
  type: SlideType;
  question?: string | Question;
}

export enum SlideType {
  Content = 'content',
  Input = 'input',
}
