export interface Field {
  _id: string;
  question: string;
  subType: "shortText" | "longText" | "codeEditor"; // you can extend
}

export interface Round {
  _id: string;
  order: number;
  title: string;
  type: "form" | "instruction"; 
  fields?: Field[]; // optional, only if type=form/coding
  instruction?: string; // optional, if type=instruction
}

export interface Process {
  _id: string;
  title: string;
  description: string;
  rounds: Round[];
  adminId: string;
  status: "draft" | "published";
  createdAt: string;
}
