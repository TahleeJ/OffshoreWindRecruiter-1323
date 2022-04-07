export type id = string;
export type hasId = { id: id };

export type RecommendedJobs = { score: number, jobOpp: JobOpp }[];


export interface SurveyTemplate {
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
    MultipleChoice = 0,
    Scale = 1,
    FreeResponse = 2
}

export interface SurveyAnswer {
    text: string
    labelIds: id[]
}

export interface Label {
    name: string
}


export interface SurveyResponse {
    surveyId: id 
    taker: SurveyTaker
    created?: number

    /**
     * Scale: [0-4]
     * MultipleChoice: [0-n]
     * FreeResponse: string
     */
    answers: (number | string)[]  

    recommendedJobs?: RecommendedJob[]
}

export interface SurveyTaker {
    name: string
    email: string
    phone: string
}

export interface RecommendedJob {
    score: number
    jobOppId: id
}


export interface JobOpp {
    jobName: string
    companyName: string
    jobDescription: string
    jobLink: string

    labelIds: id[]
}


export interface User {
    email: string
    permissionLevel: PermissionLevel
}

export enum PermissionLevel {
    None,
    Admin,
    Owner
}


export interface ApplicationFlags {
    promoteToOwner: boolean
    demoteOwner: boolean
}