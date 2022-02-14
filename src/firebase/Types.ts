export interface Survey {
    title: string
    description: string
    questions: SurveyQuestion[]
}

export interface SurveyQuestion {
    prompt: string
    answers: Answer[]
    questionType: QuestionType
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
