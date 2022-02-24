export interface Survey {
    title: string
    description: string
    questions: SurveyQuestion[]
}

export interface SurveyQuestion {
    prompt: string
    options: Answer[]
    questionType: QuestionType
}

export interface SurveyResponse {
    questions: SurveyQuestion[]
    answers: Answer[]
    taker: SurveyTaker
}

export enum QuestionType {
    Scale,
    MultipleChoice,
    FreeResponse
}

export interface Answer {
    text: string
    labelIds: string[]
}

export interface JobOpp {
    jobName: string;
    companyName: string;
    labelIds: string[];
    jobDescription: string;
}

export interface RecommendedJobs {
    taker: SurveyTaker;
    jobs: string[];
}

export interface Label {
    name: string;
    jobIds: string[];
}

export interface User {
    email: string | null
    permissionLevel: PermissionLevel
}

export interface SurveyTaker {
    name: string
    email: string
    phone: string
}

export enum PermissionLevel {
    None,
    Admin,
    Owner
}