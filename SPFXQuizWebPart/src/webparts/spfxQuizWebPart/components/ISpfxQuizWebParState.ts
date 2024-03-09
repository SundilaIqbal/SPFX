import { IQuestionDetails } from "../../../Models"; //, IResponseDetails

export interface ISpfxQuizWebParState {
    showUserScreen: boolean;
    showQuizScreen: boolean;
    PollQuestions: IQuestionDetails[];
    //UserResponse: IResponseDetails[],
    userSelectedTimeZone : string;
  }