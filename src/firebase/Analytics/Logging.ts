import { analyticsInstance } from "../Firebase";
import { logEvent } from "@firebase/analytics";
import { getSurvey } from "../Queries/SurveyQueries";
import { getLabel } from "../Queries/LabelQueries";
import { RecommendedJob } from "../Types";
import { getJobOpp } from "../Queries/JobQueries";

/**
 * Custom logging function to track the surveys created
 * 
 * @param title 
 * @param user 
 */
export function logSurveyCreation(title: string, user: string) {
    logEvent(analyticsInstance, "survey_created", {
        created_survey_title: title,
        survey_created_by: user,
        debug_mode: true
    });
}

/**
 * Custom logging function to track the surveys administered
 * 
 * @param title 
 * @param navigator 
 */
export function logSurveyAdministered(title: string, navigator: string) {
    logEvent(analyticsInstance, "survey_administered", {
        administered_survey_title: title,
        administering_navigator: navigator,
        debug_mode: true
    });
}

export async function logJobsMatched(surveyId: string, recommendedJobs: RecommendedJob[]) {
    const surveyName = (await getSurvey(surveyId)).title;

    for (const recJob of recommendedJobs) {
        const jobOpp = await getJobOpp(recJob.jobOppId);
        const score = recJob.score;

        logEvent(analyticsInstance, "job_matched", {
            administered_survey_title: surveyName,
            job_title: jobOpp.jobName,
            matched_score: score,
            debug_mode: true
        });
    }
}

export async function logLabelsMatched(labelScores: Map<string, [number, number]>) {
    console.log(labelScores);

    // for (const [key, value] of labelScores) {
    //     console.log(`${key}: ${value}`);
    // }
}