import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {  
  type IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import SpfxQuizWebPart from './components/SpfxQuizWebPart';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';
import { ISpfxQuizWebPartProps } from './components/ISpfxQuizWebPartProps';
import { sp } from "@pnp/sp/presets/all";
import SPHelper from '../../Common/SPHelper';
import { IUserInfo } from '../../Models';

// to save the question from webpart properties
export interface ISpfxQuizWebPartWebPartProps {
  description: string;
  pollQuestions: any[];
}

export default class SpfxQuizWebPartWebPart extends BaseClientSideWebPart<ISpfxQuizWebPartWebPartProps> {
  private _isDarkTheme: boolean = false;
  private helper: SPHelper;
  private userinfo: IUserInfo;

  protected async onInit(): Promise<void> {
    await super.onInit();
    sp.setup({
        ie11: true,
        spfxContext: this.context as any
    });
  
    this.helper = new SPHelper();
    this.userinfo =  await this.helper.getCurrentUserInfo();
}

  public render(): void {
    const element: React.ReactElement<ISpfxQuizWebPartProps> = React.createElement(
      SpfxQuizWebPart,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: "",
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        currentUserInfo : this.userinfo,
        context : this.context,
        pollQuestions: this.properties.pollQuestions,
        openPropertyPane: this.openPropertyPane
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
  
  //addded to open it from the other component to configure the questions
  private openPropertyPane = (): void => {
    this.context.propertyPane.open();

  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
  
  protected get disableReactivePropertyChanges() {
    return false;
  }
  /*protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }*/

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
      return {
          pages: [
              {
                header: {
                  description: "Below properties will help you manage your questions and extra features that you can leverage."
                },
                  groups: [
                      {
                          groupFields: [
                              PropertyFieldCollectionData("pollQuestions", {
                                  key: "pollQuestions",
                                  label: "Questions List",
                                  panelHeader: "Questions list",
                                  manageBtnLabel: "Manage Questions Info",
                                  enableSorting: true,
                                  value: this.properties.pollQuestions,
                                  fields: [
                                      {
                                          id: "QTitle",
                                          title: "Question Title",
                                          type: CustomCollectionFieldType.custom,
                                          required: true,
                                          onCustomRender: (field, value, onUpdate, item, itemId) => {
                                              return (
                                                  React.createElement("div", null,
                                                      React.createElement("textarea",
                                                          {
                                                              style: { width: "220px", height: "70px" },
                                                              placeholder: "Question Title",
                                                              key: itemId,
                                                              value: value,
                                                              onChange: (event: React.FormEvent<HTMLTextAreaElement>) => {
                                                                  onUpdate(field.id, event.currentTarget.value);
                                                              },
                                                          })
                                                  )
                                              );
                                          }
                                      },
                                      {
                                          id: "QOptions",
                                          title: "Choices",
                                          type: CustomCollectionFieldType.custom,
                                          onCustomRender: (field, value, onUpdate, item, itemId) => {
                                              return (
                                                  React.createElement("div", null,
                                                      React.createElement("textarea",
                                                          {
                                                              style: { width: "220px", height: "70px" },
                                                              placeholder: "Choices separated by comma",
                                                              key: itemId,
                                                              value: value,
                                                              onChange: (event: React.FormEvent<HTMLTextAreaElement>) => {
                                                                  onUpdate(field.id, event.currentTarget.value);
                                                              },
                                                          })
                                                  )
                                              );
                                          }
                                      },
                                      {
                                        id: "QMultiChoice",
                                        title: "Multiplechoice Question",
                                        type: CustomCollectionFieldType.boolean,
                                        defaultValue: false
                                    },
                                    {
                                      id: "CorrectAnswer",
                                      title: "Correct Answer",
                                      type: CustomCollectionFieldType.custom,
                                      required: true,
                                      onCustomRender: (field, value, onUpdate, item, itemId) => {
                                          return (
                                              React.createElement("div", null,
                                                  React.createElement("input",
                                                      {
                                                          style: { width: "220px", height: "70px" },
                                                          placeholder: "Correct Choice",
                                                          key: itemId,
                                                          value: value,
                                                          onChange: (event: React.FormEvent<HTMLTextAreaElement>) => {
                                                              onUpdate(field.id, event.currentTarget.value);
                                                          },
                                                      })
                                              )
                                          );
                                      }
                                  },
                                  ],
                                  disabled: false
                              })
                          ]
                      }
                  ]
              }
          ]
      };
  }
}
