import { analyticsInstance } from "../Firebase";
import { logEvent } from "@firebase/analytics";

// Track surveys created
export function logSurveyCreation(title: string, user: string) {
    logEvent(analyticsInstance, "survey_created", 
        {
            created_survey_title: title,
            survey_created_by: user,
            debug_mode: true
        });
}

// Track surveys administered
export function logSurveyAdministered(title: string, navigator: string) {
    logEvent(analyticsInstance, "survey_administered",
        {
           administered_survey_title: title,
           administering_navigator: navigator,
           debug_mode: true
        });
}