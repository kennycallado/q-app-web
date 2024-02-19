import { Answer } from "./answer.model";
import { Resource } from "./resource.model";

export type TPaper = {
  id: string;
  user: string; // user id
  resource: string | Resource; // resource id
  completed: boolean;
  answers: string[] | Answer[];
  created: Date;
}

export class Paper {
  id: string;
  user: string; // user id
  resource: string | Resource; // resource id
  completed: boolean;
  answers: string[] | Answer[];
  created: Date;
}

export class PaperToPush {
  id: string;
  answers: string[];

  constructor(id: string, answers?: string[] | Answer[]) {
    this.id = id;
    this.answers = answers ? answers.map((answer: any) => typeof answer === 'string' ? answer : answer.id) : [];
  }
}

export class PaperWithResource {
  id: string;
  user: string; // user id
  resource: Resource; // resource id
  completed: boolean;
  answers: Answer[];
  created: Date;
}
