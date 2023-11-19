import { Answer } from "./answer.model";
import { Resource } from "./resource.model";

export class Paper {
  id: string;
  user: string; // user id
  resource: string | Resource; // resource id
  completed: boolean;
  answers?: string[] | Answer[];
}

export class PaperPush {
  id: string;
  user: string; // user id
  resource: Resource; // resource id
  completed: boolean;
  answers?: Answer[];
}
