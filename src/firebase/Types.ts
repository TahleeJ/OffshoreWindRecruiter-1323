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
    question: SurveyQuestion
    answer: Answer
    user: User
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

export interface User {
    email: string | null
    permissionLevel: PermissionLevel
}

export enum PermissionLevel {
    None,
    Admin,
    Owner
}