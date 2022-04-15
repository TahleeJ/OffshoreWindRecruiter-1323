export type id = string;
export type hasId = { id: id };


export interface SurveyTemplate {
    title: string
    description: string
    components: SurveyComponent[]
}

export interface SurveyComponent {
    prompt: string
    answers: SurveyAnswer[]
    hash: number

    componentType: ComponentType
}

// Flag enum for
export enum ComponentType {
    Text = 1,
    Image = 2,

    MultipleChoice = 4,
    Scale = 8,
    FreeResponse = 16,

    NoLabel = Text | Image | FreeResponse
}

export interface SurveyAnswer {
    text: string
    labelIds: id[]
}

export interface Label {
    name: string
}


export interface AdministeredSurveyResponse {
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
