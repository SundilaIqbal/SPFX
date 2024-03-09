
import { sp } from "@pnp/sp";
/*import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/folders/web";
import "@pnp/sp/files/folder";
import "@pnp/sp/items/list";
import "@pnp/sp/fields/list";
import "@pnp/sp/views/list";
import "@pnp/sp/site-users/web";*/
import { IList } from "@pnp/sp/lists";
//import { IItemAddResult } from "@pnp/sp/items";
import * as _ from "lodash";
import { IResponseDetails } from "../Models";

export default class QuizSPHelper {
   
    private _list: IList = null as any;
    private lst_response: string = "";
    

    public constructor() {
        this.lst_response = "Quiz Responses";
        this._list = sp.web.lists.getByTitle(this.lst_response);
    }
    
   
    //if list is not present, create one
    public checkUserResponseListExistsOrCreate = async (): Promise<boolean> => {
        
        return new Promise<boolean>(async (res, rej) => {
            sp.web.lists.getByTitle(this.lst_response).get().then((listExists) => {
                res(true);
            }).catch(async err => {
                let listExists = await (await sp.web.lists.ensure(this.lst_response)).list;
                await listExists.fields.addText('BId', 255, { Required: true, Description: '' });
                await listExists.fields.addText('UserEmail', 255, { Required: true, Description: '' });
                await listExists.fields.addText('AnswerByUser', 255, { Required: true, Description: '' });
                await listExists.fields.addBoolean('Corrected');
                await listExists.fields.addBoolean('Skipped');
                //await listExists.fields.addMultilineText('UserResponse', 6, false, false, false, false, { Required: false, Description: '' });
                let allItemsView = await listExists.views.getByTitle('All Items');
                await allItemsView.fields.add('BId');
                await allItemsView.fields.add('UserEmail');
                await allItemsView.fields.add('AnswerByUser');
                await allItemsView.fields.add('Corrected');
                await allItemsView.fields.add('Skipped');
                res(true);
            });
        });
    }
    //save question response to the list
    public submitUserResponse = async (userResponse: IResponseDetails): Promise<boolean> => {
        return new Promise<boolean>(async (res, rej) => {
            await this._list.items.add({
                Title: userResponse.Title,
                UserEmail: userResponse.UserID,
                BId : userResponse.BId,
                AnswerByUser: userResponse.UserSelectedAnswer,
                Corrected: userResponse.Corrected,
                Skipped: userResponse.SkippedQuestion
            }).then((responseSubmitted) => {
                res(true);
            }).catch(async err => {
                res(false);
            });
        });

    }
}