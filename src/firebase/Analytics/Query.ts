import { getBigQueryData } from '../Firebase';
import { queryFunctions, DataQuery, Subject, SerializedEntry } from './Utility';

/**
 * Function to actually send a desired query to BigQuery
 *
 * @param subject the subject type the query will focus around
 * @param queryType the type of query that will be sent
 * @param forDay whether the data should be focused on a single, specified day
 * @param startDate the specific start date that the data should focus on
 * @param jobName the name of the job to pull data for
 * @param selectedNavigator the specific navigator email that they data should focus on
 * @returns the retrieved BigQuery data is a more easy to operate on format
 */
export async function getQueryData(subject: Subject, queryType: DataQuery, forDay: boolean, startDate: string, selectedNavigator?: string, jobNames?: string[], labelNames?: string[]) {
    const queryFunction = queryFunctions[queryType];
    let response;

    switch (subject) {
    case Subject.Surveys:
        if ((queryType & DataQuery.SurveysAll) === 0) {
            const queryString = `SELECT * FROM analytics_305371849.${queryFunction}("${selectedNavigator}", ${forDay}, "${startDate}")`;

            response = await getBigQueryData({ queryString: queryString, navigatorEmail: selectedNavigator });
        } else {
            const queryString = `SELECT * FROM analytics_305371849.${queryFunction}(${forDay}, "${startDate}")`;

            response = await getBigQueryData({ queryString: queryString });
        }

        return serializeSurveyData(response.data as string[], queryType);
    case Subject.Jobs:
        if ((queryType & DataQuery.RequiresJobName) !== 0) {
            const serializedJobData = new Map<string, SerializedEntry[]>();

            for (const jobName of jobNames!) {
                const queryString = `SELECT * FROM analytics_305371849.${queryFunction}("${jobName}", ${forDay}, "${startDate}")`;

                response = await getBigQueryData({ queryString: queryString });

                const serializedData: any = serializeJobData(response.data as string[], queryType);

                for (const [key, value] of serializedData) {
                    if (serializedJobData.has(key)) {
                        const currentData = serializedJobData.get(key);

                            currentData!.push(value);

                            serializedJobData.set(key, currentData!);
                    } else {
                        serializedJobData.set(key, [value]);
                    }
                }
            }

            return serializedJobData;
        } else {
            const queryString = `SELECT * FROM analytics_305371849.${queryFunction}(${forDay}, "${startDate}")`;

            response = await getBigQueryData({ queryString: queryString });

            const serializedData = serializeJobData(response.data as string[], queryType);

            return serializedData;
        }
    case Subject.Labels:
        if (queryType === DataQuery.LabelAverage) {
            const serializedLabelData = new Map<string, SerializedEntry[]>();

            for (const labelName of labelNames!) {
                const queryString = `SELECT * FROM analytics_305371849.${queryFunction}("${labelName}", ${forDay}, "${startDate}")`;

                response = await getBigQueryData({ queryString: queryString });
                console.log(response);

                const serializedData: any = serializeLabelData(response.data as string[], queryType);

                for (const [key, value] of serializedData) {
                    if (serializedLabelData.has(key)) {
                        const currentData = serializedLabelData.get(key);

                            currentData!.push(value);

                            serializedLabelData.set(key, currentData!);
                    } else {
                        serializedLabelData.set(key, [value]);
                    }
                }
            }

            return serializedLabelData;
        } else {
            const queryString = `SELECT * FROM analytics_305371849.${queryFunction}("${labelNames![0]}", ${forDay}, "${startDate}")`;

            response = await getBigQueryData({ queryString: queryString });

            const serializedData = serializeLabelData(response.data as string[], queryType);

            return serializedData;
        }
    }
}

// TitleDay
// date -> {title, frequency}
//
// PerDay
// date -> {frequency}
//
// Titles
// {title, frequency}

/**
 * Turns the data received from BigQuery into a more chart-operational format
 *
 * @param data the data sent back from BigQuery
 * @param queryType the type of query used to get data from BigQuery
 * @returns the transformed set of data
 */
function serializeSurveyData(data: string[], queryType: DataQuery) {
    if ((queryType & DataQuery.SurveysAll) !== 0) {
        if (queryType !== DataQuery.AllTitles) {
            const serializedData = new Map<string, SerializedEntry[]>();

            // TitleDay & PerDay
            for (const element of data) {
                const elementJSON = JSON.parse(element);
                const newData = { surveyFrequency: elementJSON.frequency } as SerializedEntry;

                if (queryType === DataQuery.AllTitlesPerDay) {
                    newData.surveyTitle = elementJSON.survey_title;
                }

                if (serializedData.has(elementJSON.event_date)) {
                    const currentData = serializedData.get(elementJSON.event_date)!;

                    currentData!.push(newData);

                    serializedData.set(elementJSON.event_date, currentData);
                } else {
                    serializedData.set(elementJSON.event_date, [newData]);
                }
            }

            return serializedData;
        } else {
            const serializedData = [] as SerializedEntry[];

            for (const element of data) {
                const elementJSON = JSON.parse(element);

                serializedData.push({ surveyTitle: elementJSON.survey_title, surveyFrequency: elementJSON.frequency } as SerializedEntry);
            }

            return serializedData;
        }
    } else {
        if ((queryType & DataQuery.SurveysTitles) === 0) {
            const serializedData = new Map<string, Map<string, SerializedEntry[]>>();

            for (const element of data) {
                const elementJSON = JSON.parse(element);
                const newData = { surveyFrequency: elementJSON.frequency } as SerializedEntry;

                if (queryType === DataQuery.OneTitlesPerDay) {
                    newData.surveyTitle = elementJSON.survey_title;
                }

                if (serializedData.has(elementJSON.navigator)) {
                    const currentMap = serializedData.get(elementJSON.navigator);

                    if (currentMap!.has(elementJSON.event_date)) {
                        const currentData = serializedData.get(elementJSON.navigator)!.get(elementJSON.event_date)!;

                        currentData!.push(newData);

                        serializedData.get(elementJSON.navigator)!.set(elementJSON.event_date, currentData);
                    } else {
                        serializedData.get(elementJSON.navigator)!.set(elementJSON.event_date, [newData]);
                    }
                } else {
                    const newMap = new Map<string, SerializedEntry[]>();

                    newMap.set(elementJSON.event_date, [newData]);

                    serializedData.set(elementJSON.navigator, newMap);
                }
            }

            return serializedData;
        } else {
            const serializedData = new Map<string, SerializedEntry[]>();

            for (const element of data) {
                const elementJSON = JSON.parse(element);
                const newData = { surveyTitle: elementJSON.survey_title, surveyFrequency: elementJSON.frequency } as SerializedEntry;

                if (serializedData.has(elementJSON.navigator)) {
                    serializedData.get(elementJSON.navigator)!.push(newData);
                } else {
                    serializedData.set(elementJSON.navigator, [newData]);
                }
            }

            return serializedData;
        }
    }
}

function serializeJobData(data: string[], queryType: DataQuery) {
    if ((queryType & DataQuery.JobsTieredAverageMatches) === 0) {
        if ((queryType & DataQuery.JobsSurveys) === 0) {
            if ((queryType & DataQuery.JobsTotalMatches) !== 0) {
                // date -> {job title, count}

                const serializedData = new Map<string, SerializedEntry>();

                for (const element of data) {
                    const elementJSON = JSON.parse(element);

                    const frequency = (elementJSON.frequency === undefined) ? 0 : elementJSON.frequency;

                    serializedData.set(elementJSON.event_date, { jobName: elementJSON.job_title, matchFrequency: frequency });
                }

                return serializedData;
            } else {
                // date -> {job title, score}

                const serializedData = new Map<string, SerializedEntry>();

                for (const element of data) {
                    const elementJSON = JSON.parse(element);

                    const score = (elementJSON.average_score === undefined) ? 0 : elementJSON.average_score;

                    serializedData.set(elementJSON.event_date, { jobName: elementJSON.job_title, score: score });
                }

                return serializedData;
            }
        } else {
            if ((queryType & DataQuery.JobsSurveysTotalMatches) !== 0) {
                // date -> {survey title, count}
                console.log('here');
                const serializedData = new Map<string, SerializedEntry[]>();

                for (const element of data) {
                    const elementJSON = JSON.parse(element);
                    const frequency = (elementJSON.frequency === undefined) ? 0 : elementJSON.frequency;
                    const newData = { surveyTitle: elementJSON.survey_title, matchFrequency: frequency };

                    if (serializedData.has(elementJSON.event_date)) {
                        const currentData = serializedData.get(elementJSON.event_date);

                        currentData!.push(newData);

                        serializedData.set(elementJSON.event_date, currentData!);
                    } else {
                        serializedData.set(elementJSON.event_date, [newData]);
                    }
                }

                return serializedData;
            } else {
                // date -> {survey title, score}

                const serializedData = new Map<string, SerializedEntry[]>();

                for (const element of data) {
                    const elementJSON = JSON.parse(element);
                    const score = (elementJSON.average_score === undefined) ? 0 : elementJSON.average_score;
                    const newData = { surveyTitle: elementJSON.survey_title, score: score };

                    if (serializedData.has(elementJSON.event_date)) {
                        const currentData = serializedData.get(elementJSON.event_date);

                        currentData!.push(newData);

                        serializedData.set(elementJSON.event_date, currentData!);
                    } else {
                        serializedData.set(elementJSON.event_date, [newData]);
                    }
                }

                return serializedData;
            }
        }
    } else {
        // {job title: score}

        const serializedData: SerializedEntry[] = [];

        for (const element of data) {
            const elementJSON = JSON.parse(element);

            const score = (elementJSON.average_score === undefined) ? 0 : elementJSON.average_score;

            serializedData.push({ jobName: elementJSON.job_title, score: score });
        }

        return serializedData;
    }
}

function serializeLabelData(data: string[], queryType: DataQuery) {
    if (queryType === DataQuery.LabelPoints) {
        const serializedData: SerializedEntry[] = [];

        for (const element of data) {
            const elementJSON = JSON.parse(element);

            console.log(elementJSON);

            serializedData.push({ labelFrequency: elementJSON.frequency, linearScore: elementJSON.linear_score, percentileScore: elementJSON.percentile_score });
        }

        return serializedData;
    } else {
        const serializedData: Map<string, SerializedEntry> = new Map<string, SerializedEntry>();

        for (const element of data) {
            const elementJSON = JSON.parse(element);

            serializedData.set(elementJSON.event_date, { labelName: elementJSON.label_title, linearScore: elementJSON.average_linear, percentileScore: elementJSON.average_percentile });
        }

        return serializedData;
    }
}
