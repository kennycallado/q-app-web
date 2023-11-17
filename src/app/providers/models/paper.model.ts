import { Answer } from "./answer.model";

export class Paper {
  id: string;
  user: string; // user id
  resource: string; // resource id
  completed: boolean;
  answers?: string[] | Answer[];
}
