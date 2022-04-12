import { AdministeredSurveyResponse } from "../../src/firebase/Types";


/**
 * Test data to be used for the SurveyTests
 */
export const surveyTestData = {
    labels: {
        "label1": { "name": "1" },
        "label2": { "name": "2" },
        "label3": { "name": "3" },
        "label4": { "name": "4" },
    },

    jobOpps: [
        {
            "jobName": "1,2",
            "labelIds": [
                "label1",
                "label2"
            ],
        },
        {
            "jobName": "3,4",
            "labelIds": [
                "label4",
                "label3"
            ],
        },
        {
            "jobName": "1,3",
            "labelIds": [
                "label1",
                "label3"
            ],
        },
    ],

    response: {
        surveyId: "surveyTemplate1",
        answers: [ 4, 4, 0, 0, 4, 0],
        taker: {}
    } as AdministeredSurveyResponse,

    surveyTemplate: {
        "surveyTemplate1" : {
            "questions": [
                {
                    "questionType": 1,
                    "answers": [
                        {
                            "labelIds": [
                                "label1"
                            ],
                            "text": ""
                        }
                    ]
                },
                {
                    "questionType": 1,
                    "answers": [
                        {
                            "labelIds": [
                                "label2"
                            ],
                            "text": ""
                        }
                    ]
                },
                {
                    "questionType": 1,
                    "answers": [
                        {
                            "labelIds": [
                                "label3"
                            ],
                            "text": ""
                        }
                    ]
                },
                {
                    "questionType": 1,
                    "answers": [
                        {
                            "labelIds": [
                                "label4"
                            ],
                            "text": ""
                        }
                    ]
                },
                {
                    "questionType": 1,
                    "answers": [
                        {
                            "text": "",
                            "labelIds": [
                                "label1",
                                "label2"
                            ]
                        }
                    ]
                },
                {
                    "questionType": 1,
                    "answers": [
                        {
                            "text": "",
                            "labelIds": [
                                "label3",
                                "label4"
                            ]
                        }
                    ]
                }
            ]
        }
    }
};
