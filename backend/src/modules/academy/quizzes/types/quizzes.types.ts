
export interface QuizQuestionInput {
  prompt: string;
  explanation?: string;
  options: { label: string; isCorrect: boolean }[];
}
