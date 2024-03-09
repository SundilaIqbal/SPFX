import {    IDropdownOption } from '@fluentui/react/lib/Dropdown';

export interface IUserInfoScreenState{
    dropDownSelectedItem : IDropdownOption;
    countryDropDownSource :IDropdownOption[];
    timeZoneDropDownSource :IDropdownOption[];
    timeZoneDownSelectedItem : IDropdownOption;
    listExists: boolean;
    isError : boolean;
    errorMessage : string;
  }