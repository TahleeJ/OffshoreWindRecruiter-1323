export type id = string;
export type hasId = { id: id };


export interface Survey {
    title: string
    description: string
    questions: SurveyQuestion[]
}

export interface SurveyQuestion {
    prompt: string
    answers: Answer[]
    questionType: Question
}

export enum Question {
    Scale,
    MultipleChoice,
    FreeResponse
}

export interface Answer {
    text: string
    labelIds: id[]
}

export interface Label {
    name: string
}


export interface SurveyResponse {
    questions: SurveyQuestion[]
    answers: Answer[]
    taker: SurveyTaker
}

export interface SurveyTaker {
    name: string
    email: string
    phone: string
}


export interface JobOpp {
    jobName: string;
    companyName: string;
    labelIds: string[];
    jobDescription: string;
}

export interface RecommendedJobs {
    jobs: JobOpp[] | null
}


export interface User {
    email: string | null
    permissionLevel: PermissionLevel
}

export enum PermissionLevel {
    None,
    Admin,
    Owner
}
