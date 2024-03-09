import { IUserInfo } from "../../../Models";
import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ISpfxQuizWebPartProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  currentUserInfo: IUserInfo;
  context: WebPartContext; 
  pollQuestions: any[];
  openPropertyPane: () => void;
}
