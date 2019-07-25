export interface ConversationStep {
  id: string;
  question: string;
  answerOptions?: Answer[];
}

export interface Answer {
  answer: string;
  nextState: string;
}
