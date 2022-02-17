export interface Survey {
    title: string
    description: string
    questions: SurveyQuestion[]
    answers: SurveyResponse[] | null
}

export interface SurveyQuestion {
    prompt: string
    answers: Answer[]
    questionType: QuestionType
}

export interface SurveyResponse {
    question: SurveyQuestion[]
    answer: Answer[]
    taker: SurveyTaker
}

export enum QuestionType {
    Scale,
    MultipleChoice,
    FreeResponse
}

export interface Answer {
    text: string
    labels: string[]
}

export interface Job {
    jobName: string
    companyName: string
    labels: string[]
    jobDescription: string
}

export interface RecommendedJobs {
    taker: SurveyTaker
    jobs: Job[] | null
}

export interface User {
    email: string | null
    permissionLevel: PermissionLevel
}

export interface SurveyTaker {
    email: string
    name: string
    birthdate: string
}

export enum PermissionLevel {
    None,
    Admin,
    Owner
}