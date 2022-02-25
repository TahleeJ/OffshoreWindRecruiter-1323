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

export enum QuestionType {
    Scale,
    MultipleChoice,
    FreeResponse
}

export interface Answer {
    text: string
    labels: Label[]
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
    jobName: string
    companyName: string
    labels: Label[]
    jobDescription: string
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
