
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
import { IUserDetails } from "../Models";

//added for mapping the frontend function logic
export default class UserInfoSPHelper {  
    private _list: IList = null as any;
    private lst_response: string = "";

    public constructor() {
        this.lst_response = "User Data";
        this._list = sp.web.lists.getByTitle(this.lst_response);
    }
    
    //check if user list doesnt exist, create and set it
    //return true or false to echeck
    public checkUserListExistsOrCreate = async (): Promise<boolean> => {
        return new Promise<boolean>(async (res, rej) => {
            sp.web.lists.getByTitle(this.lst_response).get().then((listExists) => {
                res(true);
            }).catch(async err => {
                let listExists = await (await sp.web.lists.ensure("User Data")).list;
                await listExists.fields.addText('Email', 255, { Required: true, Description: '' });
                await listExists.fields.addText('Country',255, { Required: true, Description: '' });
                await listExists.fields.addText('UserSelectedTimeZone',255, { Required: true, Description: '' });
                let allItemsView = await listExists.views.getByTitle('All Items');
                await allItemsView.fields.add('Email');
                await allItemsView.fields.add('Country');
                await allItemsView.fields.add('UserSelectedTimeZone');
                console.log(err)
                res(true);
            });
        });
    }
    
    //add user data to the SharePoint list
    public addUserData = async (userResponse: IUserDetails): Promise<boolean> => {
       return new Promise<boolean>(async (res, rej) => {
            await this._list.items.add({
                Title: userResponse.UserDisplayName,
                Email: userResponse.email,
                Country: userResponse.Country,
                UserSelectedTimeZone : userResponse.UserSelectedTimeZone
            }).then((listExists) => {
                res(true);
            }).catch(async err => {
                console.log(err);
                res(false);
            });
        });

    }
}