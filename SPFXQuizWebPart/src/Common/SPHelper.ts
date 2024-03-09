import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/folders/web";
import "@pnp/sp/files/folder";
import "@pnp/sp/items/list";
import "@pnp/sp/fields/list";
import "@pnp/sp/views/list";
import "@pnp/sp/site-users/web";
//import { IList } from "@pnp/sp/lists";
//import { IItemAddResult } from "@pnp/sp/items";
import * as _ from "lodash";
import { IUserInfo } from "../Models"; //, IResponseDetails

export default class SPHelper {
   //will be used to get data from quiz questions list
    //private _list: IList = null as any;
    private lst_response: string = "";

    public constructor() {
        this.lst_response = "Quiz Questions";
        //this._list = sp.web.lists.getByTitle(this.lst_response);
    }
    /**
     * Get the current logged in user information
     */
    public getCurrentUserInfo = async (): Promise<IUserInfo> => {
        let userinfo: IUserInfo = null as any;
        let currentUserInfo = await sp.web.currentUser.get();
        userinfo = {
            ID: currentUserInfo.Id.toString(),
            Email: currentUserInfo.Email,
            LoginName: currentUserInfo.LoginName,
            DisplayName: currentUserInfo.Title,
            Picture: '/_layouts/15/userphoto.aspx?size=S&username=' + currentUserInfo.UserPrincipalName,
        };
        return userinfo;
    }
    
    /**
     * Check and create the User response list.
     */
    public checkListExists = async (): Promise<boolean> => {
        return new Promise<boolean>(async (res, rej) => {
            sp.web.lists.getByTitle(this.lst_response).get().then((listExists) => {
                res(true);
            }).catch(async err => {
                res(false);
            });
        });
    }
  
    
    
}

