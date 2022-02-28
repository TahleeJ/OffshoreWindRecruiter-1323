export type id = string;
export type hasId = { id: id };


export interface Survey {
    title: string
    description: string
    questions: SurveyQuestion[]
}

export interface SurveyQuestion {
    prompt: string
    answers: SurveyAnswer[]
    questionType: QuestionType
}   

export enum QuestionType {
    Scale,
    MultipleChoice,
    FreeResponse
}

export interface SurveyAnswer {
    text: string
    labelIds: id[]
}

export interface Label {
    name: string
}


export interface SurveyResponse {
    questions: SurveyQuestion[]
    answers: SurveyAnswer[]
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
