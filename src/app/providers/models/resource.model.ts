import { Question } from "./question.model";
import { Slide } from "./slide.model";

export type TResource = {
  id: string;
  ref: string;
  description: string;
  title: string;
  type: ResourceType;
  form?:   string[] | Question[];
  module?: string[] | Slide[];
  slides?: string[] | Slide[];
}

export class Resource {
  id: string;
  ref: string;
  description: string;
  title: string;
  type: ResourceType;
  form?:   string[] | Question[];
  module?: string[] | Slide[];
  slides?: string[] | Slide[];
}

export enum ResourceType {
  Slides = "slides",
  Module = "module",
  Form   = "form",
  External = "external",
}
