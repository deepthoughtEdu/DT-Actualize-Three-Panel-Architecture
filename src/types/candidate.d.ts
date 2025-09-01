export interface Candidate {
  _id: string;
  name: string;
  email: string;
  passwordHash: string; // hashed password
  createdAt: string;
}
