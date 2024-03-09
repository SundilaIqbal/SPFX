export interface IQuestionDetails {
	Id: string;
	DisplayName: string;
	Choices?: string;
	MultiChoice?: boolean;
	selectedValue : string;
	CorrectAnswer : string;
}