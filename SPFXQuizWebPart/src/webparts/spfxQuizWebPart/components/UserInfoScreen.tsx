import * as React from 'react';

import {Label, Dropdown,  IDropdownOption, IDropdownStyles ,TextField, PrimaryButton, MessageBar,
  MessageBarType,  Stack, IStackProps, IStackStyles} from '@fluentui/react';
import { HttpClient, SPHttpClientResponse, IHttpClientOptions } from '@microsoft/sp-http';
import type { IUserInfoScreenProps } from './IUserInfoScreenProps';
import type { IUserInfoScreenState } from './IUserInfoScreenState';
import  UserInfoSPHelper  from "../../../Common/UserInfoSPHelper"
import {  IUserDetails } from "../../../Models"
import { WebPartContext } from "@microsoft/sp-webpart-base";
const countryList = require('country-list')

//properties will be used for Fluent UI
const stackTokens = { childrenGap: 50 };
const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 15 },
  styles: { root: { width: 300 } },
};
const dropdownStyles: Partial<IDropdownStyles> = { dropdown: { width: 300 } };

export default class UserInfoScreen extends React.Component<IUserInfoScreenProps, IUserInfoScreenState> { 
  private aContext: WebPartContext;
  private helper: UserInfoSPHelper;
  
  constructor(props: IUserInfoScreenProps) {
    super(props);

    this.state = {
      dropDownSelectedItem: null as any,
      countryDropDownSource : [],
      timeZoneDownSelectedItem: null as any,
      timeZoneDropDownSource : [],
      listExists:false, //to check the user data list
      isError : false,
      errorMessage: ""
    };
    this.onChange = this.onChange.bind(this);
    this.onChangeTimeZone = this.onChangeTimeZone.bind(this);
    this.SubmitUserDetail = this.SubmitUserDetail.bind(this);
    this.aContext = this.props.acontext;
    this.helper = new UserInfoSPHelper();
  }

  //get inital country and available time zone data via api 
  //show and then save the data 
  public componentWillMount = () => {
    this.GetCountryData();
    this.GetAvailableTimeZone();
  }


  public  render(): React.ReactElement<IUserInfoScreenProps> {   
    const selectedItem = this.state.dropDownSelectedItem;
    const timeZoneSelectedItem = this.state.timeZoneDownSelectedItem;
    //const resetChoice = React.useCallback(() => setChoice(undefined), []);
    return (   
      <div> 
        <h2>Please input required information to continue...</h2>
         <Label>Input for timezone and country will be required to proceed with the Quiz Questions and their validation.</Label>
         <br></br>
         <Stack horizontal tokens={stackTokens} styles={stackStyles}>
          <Stack {...columnProps}>
            <TextField disabled label="User Name" readOnly defaultValue={this.props.userDisplayName}  />
        
            <Dropdown label="Select Country" required
              selectedKey={selectedItem ? selectedItem.key : undefined}
              onChange={this.onChange}
              placeholder="Select your country"
              options={this.state.countryDropDownSource}
              styles={dropdownStyles} 
            />
          </Stack>
          <Stack {...columnProps}>
            <TextField disabled label="User Email" readOnly defaultValue={this.props.userEmail} />
            <Dropdown label="Select your timezone" required
              selectedKey={timeZoneSelectedItem ? timeZoneSelectedItem.key : undefined}
              onChange={this.onChangeTimeZone}
              placeholder="Select your country"
              options={this.state.timeZoneDropDownSource}
              styles={dropdownStyles} 
            />
            <br></br>
            <PrimaryButton style={{alignSelf:'end', width:'150px'}}  onClick={this.SubmitUserDetail} >Start Quiz</PrimaryButton>
          </Stack>
        </Stack>
        { this.state.isError &&
        <div>
          <br></br>
          <MessageBar
                messageBarType={MessageBarType.error}  isMultiline={false}  dismissButtonAriaLabel="Close">
                {this.state.errorMessage}
              </MessageBar></div>
        }
        
      </div>
    );
  }

  //on change function for the country drop control
  onChange(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void 
  {
    this.setState({
      dropDownSelectedItem : item
    });
    
  }

  //on change function for the timezone drop control
  onChangeTimeZone(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void 
  {
    this.setState({
      timeZoneDownSelectedItem : item
    });
    
  }
  //get countrylist and populate dropdown
  GetCountryData() : void
  {
    var countryListData = countryList.getData();
    var countryDropDown :IDropdownOption[] = [];
    //convert into dropdown options format
    countryListData.forEach(function(item:any) {
      countryDropDown.push(
         { key: item.code, text: item.name }
      )
    });
    this.setState({
      countryDropDownSource : countryDropDown
    })
  }

  //get timezone list and populate dropdown
  GetAvailableTimeZone() : void
  {
    const httpClientOptions: IHttpClientOptions = {
      headers: new Headers({
        'accept': 'application/json'
      }),
      method: "GET",
      mode: "cors"
      };
     this.aContext.httpClient.get(`https://timeapi.io/api/TimeZone/AvailableTimeZones`, HttpClient.configurations.v1, httpClientOptions)
      .then((response: SPHttpClientResponse) => {
        debugger;
        response.json().then(response =>
          { 
            var timeZoneDropDown :IDropdownOption[] = [];
            let keyCount = 1; 
            //convert into dropdown options format
            response.forEach(function(item:any) {
              timeZoneDropDown.push(
                { key: keyCount, text: item }
              )
              keyCount++;
            });
            
            this.setState({
              timeZoneDropDownSource : timeZoneDropDown
            })
            console.log(response)
          });
      })
      .then((jsonResponse: any) => {
        console.log(jsonResponse);
      });
    }

  //save user data back into SharePoint list
  private async SubmitUserDetail() {
    
    if(this.state.dropDownSelectedItem && this.state.timeZoneDownSelectedItem)
    {
      this.setState({
          isError : false,
          errorMessage : ""
        });
      //check and create if user SP list is present or not
      let listCreated = await this.helper.checkUserListExistsOrCreate();
      if(listCreated)
      {
          this.helper = new UserInfoSPHelper();
          //craft user object
          let userData: IUserDetails = {
            UserDisplayName : this.props.userDisplayName,
            email : this.props.userEmail,
            Country : this.state.dropDownSelectedItem.text,
            UserSelectedTimeZone : this.state.timeZoneDownSelectedItem.text
          }
          //try and add user data 
          let userAdded = await this.helper.addUserData(userData);
          if(userAdded)
          {
              //navigate to the next screen
              this.props.parentHandler();
              this.props.setTimeZone(this.state.timeZoneDownSelectedItem.text);
          }
          else
          {
            //message user internal error and cannot go further
            //contact admin
            this.setState({
              isError : true,
              errorMessage : "There seems to be an error with User data submission, Cannot proceed further. Please contact you administrator"
              });
            }
      }
      else
      {
         //message user internal error and cannot go further
         //contact admin
         this.setState({
            isError : true,
            errorMessage : "There seems to be an error with User Data list, Cannot proceed further. Please contact you administrator"
            });
      }
    }
    else{
      //show message box that user need to select the items
      this.setState({
        isError : true,
        errorMessage : "Please select your country and timezone to proceed"
      });
    }
  }
};