import * as React from 'react';
import styles from './SpfxQuizWebPart.module.scss';
import type { ISpfxQuizWebPartProps } from './ISpfxQuizWebPartProps';
import type { ISpfxQuizWebParState } from './ISpfxQuizWebParState';
import { escape } from '@microsoft/sp-lodash-subset';
import { PrimaryButton } from '@fluentui/react';
import  UserInfoScreen from '../components/UserInfoScreen'

import { IQuestionDetails } from "../../../Models";
import QuizScreen from './QuizScreen';

export default class SpfxQuizWebPart extends React.Component<ISpfxQuizWebPartProps, ISpfxQuizWebParState> {
  constructor(props: ISpfxQuizWebPartProps) {
    super(props);
    //initliaze the value: showUserscreen and ShowQuizscreen : disabled to present the welcome screen
    this.state = {
      showUserScreen: false,
      showQuizScreen : false,
      PollQuestions: [],
      //UserResponse: [],
      userSelectedTimeZone :""
    };
    this.StartandShowUserScreen = this.StartandShowUserScreen.bind(this);
    this.ShowQuizScreen = this.ShowQuizScreen.bind(this);
    this.SetUserTimeZone = this.SetUserTimeZone.bind(this);
    this.getQuestions = this.getQuestions.bind(this);
  }

  public componentDidMount = () => {
    //get already configured questions
    this.getQuestions();
  }
  
  private getQuestions = (questions?: any[]) => {
    debugger;
    let pquestions: IQuestionDetails[] = [];
    let tmpQuestions: any[] = (questions) ? questions : (this.props.pollQuestions) ? this.props.pollQuestions : [];
    if (tmpQuestions && tmpQuestions.length > 0) {
      tmpQuestions.map((question) => {
        pquestions.push({
          Id: question.uniqueId,
          DisplayName: question.QTitle,
          Choices: question.QOptions,
          MultiChoice: question.QMultiChoice,
          selectedValue: "",
          CorrectAnswer : question.CorrectAnswer
        });
      });
    }
    
    this.setState({ PollQuestions: pquestions});
  }
  
  //update the changes in questions
  public componentDidUpdate = (prevProps: ISpfxQuizWebPartProps) => {
    if (prevProps.pollQuestions !== this.props.pollQuestions ) {
      this.setState({ }, () => {
        this.getQuestions(this.props.pollQuestions);
      });
    }
  }
  
  public render(): React.ReactElement<ISpfxQuizWebPartProps> {
    const showUserScreen:boolean = this.state.showUserScreen;
    const { PollQuestions } = this.state;
    return (   
      <div>
        { showUserScreen === false && this.state.showQuizScreen === false &&
        <div >
          <WelcomeScreen  {...this.props}></WelcomeScreen>
          <PrimaryButton style={{float: 'right'}}   onClick={this.StartandShowUserScreen} >Let's Go</PrimaryButton>
        </div>
        }
        {showUserScreen && this.state.showQuizScreen === false &&
        <div >
          <UserInfoScreen setTimeZone={this.SetUserTimeZone.bind(this)} parentHandler={this.ShowQuizScreen.bind(this)} acontext={this.props.context} userDisplayName={this.props.currentUserInfo.DisplayName} userEmail={this.props.currentUserInfo.Email}></UserInfoScreen>
        </div>
        }
        {this.state.showQuizScreen &&   PollQuestions && PollQuestions.length > 0 && 
          <QuizScreen  acontext={this.props.context} userSelectedTimeZone={this.state.userSelectedTimeZone} pollQuestions={this.state.PollQuestions} userEmail={this.props.currentUserInfo.DisplayName}></QuizScreen>
        }
      </div>
    );
  }

  //startting the quiz
  StartandShowUserScreen():void
  {
    this.setState({
      showUserScreen: true
    });
  }

  //set user timezone based on the selection from user
  //screen drop down
  SetUserTimeZone(timeZone:string)
  {
    //alert('We pass argument from Child to Parent');
    this.setState({
      userSelectedTimeZone : timeZone
    });
  }

  //Handler will be passed to the child 
  //when user submits the details, question will be presented
  ShowQuizScreen()
  {
    //alert('We pass argument from Child to Parent');
    this.setState({
      showQuizScreen : true
    });
  }
}


//Welcome screen with instructions 
export class WelcomeScreen extends React.Component<ISpfxQuizWebPartProps, {}> {
  public render(): React.ReactElement<ISpfxQuizWebPartProps> {
    return (
      <section className={`${styles.spfxQuizWebPart} ${this.props.hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          {/*<img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />*/}
          <h1>Well come, {escape(this.props.currentUserInfo.DisplayName)}!</h1>
        </div>
        <div>
          <h2>Welcome to Time Zone Explorer Challenge!</h2>
          <h3>Summary/Guidelines:</h3>
          <p>
               Welcome to the "Time Zone Explorer Challenge"! Test your global timekeeping skills and geographical knowledge with this quiz that takes you on a journey across different time zones. From the islands of the Pacific to the vast landscapes of Russia, each question will challenge your ability to calculate time differences and understand the fascinating world of time zones.
          </p>
          <h4>Guidelines:</h4>
          <ul className={styles.links}>
            <li>There are five diverse questions that will take you on a virtual journey around the world.</li>
            <li>Read each question carefully, considering the time zones mentioned and the direction of travel.</li>
            <li>Choose the correct answer from the provided multiple-choice options.</li>
            <li>Each question has a logical explanation to help you understand the calculation of time differences.</li>
            <li>The quiz aims to test your knowledge of time zones, geography, and basic mathematical skills.</li>
            <li>Have fun exploring different regions of the world and discovering the intricacies of timekeeping!</li>
            <li>After completing the quiz, check your answers to see how well you fared in the "Time Zone Explorer Challenge.</li>
          </ul>
        </div></section>
    );
  }
}

