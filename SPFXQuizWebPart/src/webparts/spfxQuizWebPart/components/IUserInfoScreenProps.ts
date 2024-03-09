import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IUserInfoScreenProps{
    userDisplayName: string;
    userEmail : string;
    acontext: WebPartContext; 
    parentHandler: Function;
    setTimeZone : Function;
  }