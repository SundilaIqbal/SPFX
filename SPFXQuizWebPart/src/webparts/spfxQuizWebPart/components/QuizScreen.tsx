 import * as React from 'react';
 //import styles from './SpfxQuizWebPart.module.scss';
 import type { ISpfxQuizWebPartProps } from './ISpfxQuizWebPartProps';
 //import { escape } from '@microsoft/sp-lodash-subset';
 import  QuizSPHelper  from "../../../Common/QuizSPHelper"
 import { DefaultPalette } from '@fluentui/react/lib/Styling';
 import {  TextField, PrimaryButton, Stack, IStackProps, IStackStyles,ChoiceGroup, IChoiceGroupOption, MessageBarType,MessageBar } from '@fluentui/react';
 import { VerticalBarChart, IVerticalBarChartDataPoint } from '@fluentui/react-charting';

 import {  } from '@fluentui/react/lib/TextField';
 import {  IResponseDetails } from "../../../Models";
 import { WebPartContext } from "@microsoft/sp-webpart-base";
 import { HttpClient, SPHttpClientResponse, IHttpClientOptions } from '@microsoft/sp-http';

 const stackTokens = { childrenGap: 50 };
//const iconProps = { iconName: 'Calendar' };
const stackStyles: Partial<IStackStyles> = { root: { width: 650 } };
const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 15 },
  styles: { root: { width: 300 } },
};

export interface IQuizScreenProps {
    pollQuestions: any[];
    userEmail : string;
    userSelectedTimeZone : string;
    acontext: WebPartContext; 
  }
  
export interface IQuestionReponseInner {
      QID: string;
      selecedValue: string;
}

export interface IQuizScreenState {
      pollQuestions: any[];
      responseListExists: boolean;
      UserResponse: IResponseDetails[];
      firstAnswerOption:string,
      displayQuestion: any;
      displayQuestionIndex : number;
      submitButtonText : string;
      displayFinalMessage: boolean;
      displayChoiceQuestion: boolean;
      timeForSelectedZone : string;
      isError: false,
      errorMessage : "",
      options: IChoiceGroupOption[],
      userSkippedQuestion : number,
      userCorrectQuestions: number,
      userWrongAnswers : number,
      barChartDatapoints: IVerticalBarChartDataPoint[];
}


export default class QuizScreen extends React.Component<IQuizScreenProps, IQuizScreenState> {
    private helper: QuizSPHelper = new QuizSPHelper();
    private responsesListExist: boolean = true;

    constructor(props: IQuizScreenProps) {
      super(props);
      this.state = {
        responseListExists: false,
        pollQuestions: this.props.pollQuestions,
        UserResponse: [],
        firstAnswerOption :"",
        displayQuestion: [],
        displayQuestionIndex : 0,
        submitButtonText : "Next",
        displayFinalMessage : false,
        displayChoiceQuestion: true,
        timeForSelectedZone : "",
        isError : false,
        errorMessage : "",
        options: [],
        userSkippedQuestion : 0,
        userCorrectQuestions : 0,
        userWrongAnswers: 0,
        barChartDatapoints : []
      };
      this.helper = new QuizSPHelper();
      this.ShowChartToUser = this.ShowChartToUser.bind(this);
      this.getDisplayQuestion = this.getDisplayQuestion.bind(this);
      this._onTextChange = this._onTextChange.bind(this);
      this._onChange = this._onChange.bind(this);
      this.SubmitUserResponse = this.SubmitUserResponse.bind(this);
      this.GetTimeforTheSelectedTimeZone = this.GetTimeforTheSelectedTimeZone.bind(this);
      this.ConvertChoicesIntoDropDownOption = this.ConvertChoicesIntoDropDownOption.bind(this);
    }
        
    private async getDisplayQuestion() {
        await this.setState({
          displayQuestion :this.state.pollQuestions[this.state.displayQuestionIndex]
        });
        debugger;
        this.ConvertChoicesIntoDropDownOption(this.state.displayQuestion.Choices);
        if(this.state.displayQuestion.MultiChoice)
        {
          this.setState({
            displayChoiceQuestion : true
          });
        }
        else{
          this.setState({
            displayChoiceQuestion : false
          });
        }
      }
    
  public async ConvertChoicesIntoDropDownOption(choicesString: string)
  {
    var optionForQuestions :IChoiceGroupOption[] = [];
    let choices = choicesString.split(',');
    choices.forEach(choice => {
      optionForQuestions.push(
        { key: choice.trim(), text: choice.trim() }
      )
    });
    this.setState({
      options : optionForQuestions
    });
  }  
    
  public  componentWillMount = () => {
        this.GetTimeforTheSelectedTimeZone();
        this.getDisplayQuestion();
      }
     
   public render(): React.ReactElement<ISpfxQuizWebPartProps> {
    
   //const PollQuestions = this.props.pollQuestions;
    const question = this.state.displayQuestion;
    const showMessage = this.state.displayFinalMessage;
    const rootStyle = { width: '650px', height: '400px' };
    const customColors = [DefaultPalette.greenLight, DefaultPalette.green, DefaultPalette.greenDark];
  
    //auto mapping of the questions
    return (
      <section>
        { showMessage === false && 
            <div>
              <Stack horizontal tokens={stackTokens} styles={stackStyles}>
          <Stack {...columnProps}>
            <TextField  label={"Your Selected timezone:"} value="Africa/Abidjan" disabled/>
          </Stack>
          <Stack {...columnProps}>
            <TextField  label={"Current time for this zone"} value={this.state.timeForSelectedZone} disabled/>
          </Stack>
        </Stack>
        <br></br>
              <h3>Question:</h3>
            </div>
        }
        
        {showMessage === false && this.state.displayChoiceQuestion === false &&
          <TextField  label={question.DisplayName} value={this.state.firstAnswerOption} onChange={this._onTextChange}/>
        }

        {showMessage === false && this.state.displayChoiceQuestion  &&
            <ChoiceGroup   options={this.state.options} onChange={this._onChange} label={question.DisplayName} required={true} />
        }
        {showMessage === false &&
          <div>
            <br></br> 
            <PrimaryButton style={{float:'right' ,alignSelf:'end', width:'10px'}}  onClick={this.SubmitUserResponse} >{this.state.submitButtonText}</PrimaryButton>
          </div>
        }
        { showMessage &&
          <div>
          {/*  <img alt="" src={ require('../assets/success.png') }  style={{width:'100px'}}/>
          <h1>Your response has been submitted, Result will be displayed over your company site.</h1>*/}
          <MessageBar  messageBarType={MessageBarType.success}  isMultiline={false} dismissButtonAriaLabel="Close" >
          Thank you for your submission.</MessageBar>
          <div style={rootStyle}>
              <VerticalBarChart
                chartTitle="Vertical bar chart rotated labels example "
                data={this.state.barChartDatapoints}
                height={350}
                width={650}
                hideLegend={true}
                colors={customColors}
                enableReflow={true}
              />
            </div>
          </div>
          
        }
        { this.state.isError &&  <div>
              <br></br><MessageBar  messageBarType={MessageBarType.error}  isMultiline={false} dismissButtonAriaLabel="Close" >
          {this.state.errorMessage}</MessageBar></div>
        }
                
      </section>
     );
   }
   

  async SubmitUserResponse()
  {
    if(this.state.submitButtonText === "Submit" )
    {
      this.setState({
        displayFinalMessage : true,
        isError:false
      });
    }
    this.helper = new QuizSPHelper();
    
    debugger;
    
    //let exists = await this.helper.checkUserResponseListExistsOrCreate(); 
     if(this.responsesListExist)
     {
      let correctAnswer = false;
        if(this.state.displayQuestion.CorrectAnswer === "verify")
        {
          let answerfromAPI = await this.VerifyTheQuestionFromAPI();
          correctAnswer = answerfromAPI === this.state.firstAnswerOption ? true: false;
        }
        else
        {
          correctAnswer = this.state.firstAnswerOption && this.state.firstAnswerOption === this.state.displayQuestion.CorrectAnswer ? true : false;
        }
         
        let skipped = this.state.firstAnswerOption ? false : true;
        //submit responses
        let answered: IResponseDetails = {
            UserID : this.props.userEmail,
            BId : "1",
            Corrected : correctAnswer,
            Title:this.state.displayQuestion.DisplayName,
            UserSelectedAnswer : this.state.firstAnswerOption,
            SkippedQuestion : skipped
        };
       
          this.setState({
            userSkippedQuestion : skipped ? this.state.userSkippedQuestion +1 : this.state.userSkippedQuestion,
            userCorrectQuestions : correctAnswer ? this.state.userCorrectQuestions +1 : this.state.userCorrectQuestions,
            userWrongAnswers : correctAnswer ===false  && skipped === false ? this.state.userWrongAnswers+1: this.state.userWrongAnswers
          });
        
        
        await this.helper.submitUserResponse(answered);
        
        if((this.state.pollQuestions.length > this.state.displayQuestionIndex)  && this.state.submitButtonText !== "Submit" )
        {
          await this.setState({
            displayQuestionIndex : this.state.displayQuestionIndex + 1,
            firstAnswerOption : ""
          });
          this.getDisplayQuestion();
        }
        if(this.state.pollQuestions.length == (this.state.displayQuestionIndex + 1)) 
        {
            await this.setState({
              submitButtonText : "Submit"
            });
        }
       
     }
     //its the final question submission click 
     //now chart will be shown to the user
     if(this.state.displayFinalMessage)
     {
        this.ShowChartToUser();
     }
  }
  
  public ShowChartToUser()
  {
    var points :IVerticalBarChartDataPoint[] = [
      {
        x: 'Skipped',
        y: this.state.userSkippedQuestion,
        color: '#C19C00',
      },
        {
          x: 'Correct',
          y: this.state.userCorrectQuestions,
          color: '#E650AF',
        },
        {
          x: 'Wrong',
          y: this.state.userWrongAnswers,
          color: '#0E7878',
        }];
  
      this.setState({
        barChartDatapoints : points
      });
  }

  public _onChange( ev: React.FormEvent<HTMLInputElement>, option: IChoiceGroupOption): void {
    this.setState({
      firstAnswerOption : option.text
    });
    debugger;
  }
  public _onTextChange(ev: React.FormEvent<HTMLInputElement>): void {
    console.log(ev.currentTarget.value);
    this.setState({
        firstAnswerOption : ev.currentTarget.value
    });
  }

  ConvertZoneDateTime(dateTimeString: string): void
  {
    let url = "https://timeapi.io/api/Conversion/Translate" ;
    //JSON.stringify({ "dateTime": "2021-03-14 17:45:00",  "languageCode": "en"})
    //`{ "dateTime": "2021-03-14 17:45:00", "languageCode": "en" }`
    const body: string = JSON.stringify({
      'dateTime': dateTimeString,
      'languageCode':  "en"
    });
     this.props.acontext.httpClient.post(url, HttpClient.configurations.v1, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json'
      },
      body: body
    })
      .then((response: SPHttpClientResponse) => {
        debugger;
        response.json().then(response =>
          { 
           debugger;
            this.setState({
              timeForSelectedZone : response.friendlyDateTime
            })
            console.log(response)
          });
      })
      .then((jsonResponse: any) => {
        console.log(jsonResponse);
      });
  }


  GetTimeforTheSelectedTimeZone() : void
  {
    let url = "https://timeapi.io/api/TimeZone/zone?timeZone=Africa/Abidjan" ;//+ this.props.userSelectedTimeZone;
    const httpClientOptions: IHttpClientOptions = {
      headers: new Headers({
        'accept': 'application/json'
      }),
      mode: "cors"
      };
     this.props.acontext.httpClient.get(url, HttpClient.configurations.v1, httpClientOptions)
      .then((response: SPHttpClientResponse) => {
        debugger;
        response.json().then(response =>
          { 
             let dateTimeString = response.currentLocalTime;
              let index = dateTimeString.lastIndexOf('.');
              dateTimeString = dateTimeString.substr(0,index);
              dateTimeString = dateTimeString.replace('T', ' ');
              this.ConvertZoneDateTime(dateTimeString);
              console.log(response);
          });
      })
      .then((jsonResponse: any) => {
        console.log(jsonResponse);
      });
    }

    // function for verifying the data from the time API 
    public async VerifyTheQuestionFromAPI():Promise<string> 
    {
      return new Promise<string>(async (res, rej) => {
        let timeForSecondZone : string = "";
        let url = "https://timeapi.io/api/Conversion/ConvertTimeZone";
        const body: string = JSON.stringify({
          'fromTimeZone': "CST6CDT",
          'dateTime':  "2023-12-23 14:30:00",
          'toTimeZone': "US/Eastern",
          'dstAmbiguity' : ""
        });
        this.props.acontext.httpClient.post(url, HttpClient.configurations.v1, {
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json'
          },
          body: body
        })
          .then((response: SPHttpClientResponse) => {
            debugger;
            response.json().then(response =>
              { 
                timeForSecondZone = response.conversionResult.time;
                res(timeForSecondZone);
              });
          })
          .catch((jsonResponse: any) => {
            console.log(jsonResponse);
            res("")
          });
          
      });
    }
 }
