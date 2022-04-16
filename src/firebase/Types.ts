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

// Flag enum for survey components
// To check if a component has certain flags do
//   componentType & (Text | Image)
export enum ComponentType {
    Text = 1,
    Image = 2,

    MultipleChoice = 4,
    Scale = 8,
    FreeResponse = 16,

    Question = MultipleChoice | Scale | FreeResponse,
    NoLabel = Text | Image | FreeResponse
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

    components: StoredSurveyComponent[]

    recommendedJobs: RecommendedJob[]
}

export interface StoredSurveyComponent {
    componentHash: number
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
