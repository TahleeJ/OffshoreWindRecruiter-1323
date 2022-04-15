export type id = string;
export type hasId = { id: id };


export interface SurveyTemplate {
    title: string
    description: string
    questions: SurveyQuestion[]
}

export interface SurveyQuestion {
    prompt: string
    answers: SurveyAnswer[]
    questionType: QuestionType
    hash: number
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


export interface SentSurveyResponse {
    surveyId: id
    taker: SurveyTaker

    /**
     * Scale: [0-4]
     * MultipleChoice: [0-n]
     * FreeResponse: string
     */
    answers: (number | string)[]
}

export interface StoredSurveyResponse {
    surveyId: id
    taker: SurveyTaker
    created: number

    answers: StoredSurveyAnswer[]

    recommendedJobs: RecommendedJob[]
}

export interface StoredSurveyAnswer {
    questionHash: number
    answer: (number | string)
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

export interface RecommendedJobWithData {
    score: number
    jobOpp: JobOpp
}

export interface ReturnedSurveyResponse {
    recommendedJobs: RecommendedJob[]

    // Maps label id to [ Linear score, Percentile score ]
    labelScores: { [k: string]: [number, number] }
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
    Navigator,
    Admin,
    Owner
}


export interface ApplicationFlags {
    promoteToOwner: boolean
    demoteOwner: boolean
}
