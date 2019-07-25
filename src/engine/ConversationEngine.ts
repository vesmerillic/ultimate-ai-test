import { Answer, ConversationStep } from "../models/conversationStep"

export class ConversationEngine {
  static readonly INCORRECT_START_INPUT: string = 'Are you trying to start a conversation? Please use empty string to do so :)'
  static readonly INCORRECT_ANSWER_INPUT: string = 'Incorrect answer provided, please try again, or say \'Start from beginning\' or \'Take me to last step\''
  static readonly RECOVERY_ANSWER_RESTART: string = 'Start from beginning'
  static readonly RECOVERY_ANSWER_LAST_STEP: string = 'Go back to previous question'

  //graph of conversation structure parsed from json in the constructor
  conversationMap: Map<string, ConversationStep>
  firstStep: ConversationStep
  //steps passed in current conversation, new steps are appended to the end of list
  steps: ConversationStep[] = []

  constructor(conversationMapJSON: ConversationStep[]) {
    this.conversationMap = new Map<string, ConversationStep>()
    this.firstStep = conversationMapJSON[0]
    conversationMapJSON.forEach((value: ConversationStep) => {
      this.conversationMap.set(value.id, value)
    })
  }

  reply(userAnswer: string): string {
    if(this.steps.length > 0){
      //conversation seems to be in progress
      const chosenAnswer = this.steps[this.steps.length - 1].answerOptions.find((answer: Answer) => {
        return answer.answer == userAnswer
      })

      if(chosenAnswer){
        const nextStep = this.conversationMap.get(chosenAnswer.nextState)
        if(nextStep.answerOptions){
          this.steps.push(nextStep)
        } else {
          //finish conversation
          //here we could log or save the conversation flow
          this.steps = []
        }
        return nextStep.question
      } else {
        //answer not compatible with current question
        //check service answers
         switch(userAnswer){
           case ConversationEngine.RECOVERY_ANSWER_RESTART: {
             return this.startNewConversation()
           }
           case ConversationEngine.RECOVERY_ANSWER_LAST_STEP: {
             return this.goBackOneQuestion()
           }
           default: {
             //ask user to try again or use service options
             return ConversationEngine.INCORRECT_ANSWER_INPUT
           }
         }
      }
    } else {
      if(userAnswer === '') {
        return this.startNewConversation()
      } else {
        return ConversationEngine.INCORRECT_START_INPUT
      }
    }
  }

  private startNewConversation(): string{
    this.steps = []
    this.steps.push(this.firstStep)
    return this.firstStep.question
  }

  private goBackOneQuestion(): string{
    if(this.steps.length > 1){
      this.steps.pop()
    }
    return this.steps[this.steps.length - 1].question
  }

}
