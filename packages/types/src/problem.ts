export interface IProblem {
  type: string;
  id: number | string;
  name: string;
  problemUrl?: string;
  rating?: number;
  tags?: string[];
}
