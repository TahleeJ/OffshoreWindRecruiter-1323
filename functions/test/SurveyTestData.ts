import { ComponentType, JobOpp, Label, SentSurveyResponse, SurveyComponent, SurveyTemplate } from '../../src/firebase/Types';


/**
 * Test data to be used for the SurveyTests
 */
export const surveyTestData = {
    labels: {
        label1: { name: '1' } as Label,
        label2: { name: '2' } as Label,
        label3: { name: '3' } as Label,
        label4: { name: '4' } as Label
    },

    jobOpps: [
        {
            jobName: '1,2',
            labelIds: [
                'label1',
                'label2'
            ]
        } as JobOpp,
        {
            jobName: '3,4',
            labelIds: [
                'label4',
                'label3'
            ]
        } as JobOpp,
        {
            jobName: '1,3',
            labelIds: [
                'label1',
                'label3'
            ]
        } as JobOpp
    ],

    response: {
        surveyId: 'surveyTemplate1',
        answers: [4, 4, 0, 0, 4, 0],
        taker: {}
    } as SentSurveyResponse,

    surveyTemplate: {
        surveyTemplate1: {
            components: [
                {
                    componentType: ComponentType.Scale,
                    hash: 0,
                    answers: [
                        {
                            labelIds: [
                                'label1'
                            ],
                            text: ''
                        }
                    ]
                } as SurveyComponent,
                {
                    componentType: ComponentType.Scale,
                    hash: 0,
                    answers: [
                        {
                            labelIds: [
                                'label2'
                            ],
                            text: ''
                        }
                    ]
                } as SurveyComponent,
                {
                    componentType: ComponentType.Scale,
                    hash: 0,
                    answers: [
                        {
                            labelIds: [
                                'label3'
                            ],
                            text: ''
                        }
                    ]
                } as SurveyComponent,
                {
                    componentType: ComponentType.Scale,
                    hash: 0,
                    answers: [
                        {
                            labelIds: [
                                'label4'
                            ],
                            text: ''
                        }
                    ]
                } as SurveyComponent,
                {
                    componentType: ComponentType.Scale,
                    hash: 0,
                    answers: [
                        {
                            text: '',
                            labelIds: [
                                'label1',
                                'label2'
                            ]
                        }
                    ]
                } as SurveyComponent,
                {
                    componentType: ComponentType.Scale,
                    hash: 0,
                    answers: [
                        {
                            text: '',
                            labelIds: [
                                'label3',
                                'label4'
                            ]
                        }
                    ]
                } as SurveyComponent
            ]
        } as SurveyTemplate
    }
};
