import { analyticsInstance } from '../Firebase';
import { logEvent } from '@firebase/analytics';
import { getSurvey } from '../Queries/SurveyQueries';
import { RecommendedJob } from '../Types';
import { getJobOpp } from '../Queries/JobQueries';
import { getLabel } from '../Queries/LabelQueries';

/**
 * Custom logging function to track the surveys created
 *
 * @param title
 * @param user
 */
export function logSurveyCreation(title: string, user: string) {
    logEvent(analyticsInstance, 'survey_created', {
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
    logEvent(analyticsInstance, 'survey_administered', {
        administered_survey_title: title,
        administering_navigator: navigator
    });
}

/**
 * Custom logging function to track the jobs recommended
 *
 * @param surveyId the id of the survey used to recommend the job
 * @param recommendedJobs the recommended jobs based on the survey response
 */
export async function logJobsMatched(surveyId: string, recommendedJobs: RecommendedJob[]) {
    const surveyName = (await getSurvey(surveyId)).title;

    for (const recJob of recommendedJobs) {
        const jobOpp = await getJobOpp(recJob.jobOppId);
        const score = recJob.score;

        logEvent(analyticsInstance, 'job_matched', {
            administered_survey_title: surveyName,
            job_title: jobOpp.jobName,
            matched_score: score
        });
    }
}

/**
 * Custom logging function to track the labels used for recommending jobs
 *
 * @param labelScores the assigned linear and percentile scores for each label used
 *                    to recommend jobs
 */
export async function logLabelsUsed(labelScores: [string, [number, number]][]) {
    for (const [key, value] of labelScores) {
        const labelName = (await getLabel(key)).name;

        logEvent(analyticsInstance, 'label_used', {
            label_title: labelName,
            linear_score: value[0],
            percentile_score: value[1]
        });
    }
}
