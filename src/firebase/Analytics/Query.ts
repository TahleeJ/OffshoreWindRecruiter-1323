import { getBigQueryData } from "../Firebase";
import { queryFunctions, DataQuery, Subject, SerializedEntry } from "./Utility";

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
export async function getQueryData(subject: Subject, queryType: DataQuery, forDay: boolean, startDate: string, selectedNavigator?: string, jobNames?: string[]) {
    const queryFunction = queryFunctions[queryType];
    var response;

    switch (subject) {
        case Subject.Surveys:
            if (!([DataQuery.AllTitlesPerDay, DataQuery.AllPerDay, DataQuery.AllTitles].includes(queryType))) {
                const queryString = `SELECT * FROM analytics_305371849.${queryFunction}("${selectedNavigator}", ${forDay}, "${startDate}")`;
        
                response = await getBigQueryData({ queryString: queryString, navigatorEmail: selectedNavigator });
            } else {
                const queryString = `SELECT * FROM analytics_305371849.${queryFunction}(${forDay}, "${startDate}")`;
        
                response = await getBigQueryData({ queryString: queryString });
            }

            return serializeSurveyData(response.data as string[], queryType);
        case Subject.Jobs:
            if (!([DataQuery.SurveyNegativeJobMatches, DataQuery.SurveyPositiveJobMatches, DataQuery.AverageSurveyMatches, DataQuery.HighestAverageJobMatches, DataQuery.LowestAverageJobMatches].includes(queryType))) {
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
                const queryString = `SELECT * FROM analytics_305371849.${queryFunction}(${forDay}, "${startDate}")`

                response = await getBigQueryData({ queryString: queryString }); 
                
                const serializedData = serializeJobData(response.data as string[], queryType);

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
    if ([DataQuery.AllTitlesPerDay, DataQuery.AllPerDay, DataQuery.AllTitles].includes(queryType)) {
        if (queryType !== DataQuery.AllTitles) {
            const serializedData = new Map<string, SerializedEntry[]>();

            // TitleDay & PerDay
            for (const element of data) {
                const elementJSON = JSON.parse(element);
                const newData = { surveyFrequency: elementJSON.frequency } as SerializedEntry;

                if (queryType % 3 === 0) {
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
        if (!([DataQuery.EachTitles, DataQuery.OneTitles].includes(queryType))) {
            const serializedData = new Map<string, Map<string, SerializedEntry[]>>();

            for (const element of data) {
                const elementJSON = JSON.parse(element);
                const newData = { surveyFrequency: elementJSON.frequency } as SerializedEntry;

                if (queryType % 3 === 0) {
                    newData.surveyTitle = elementJSON.survey_title;
                }

                if (serializedData.has(elementJSON.navigator)) {
                    const currentMap = serializedData.get(elementJSON.navigator);

                    if (currentMap!.has(elementJSON.event_date)) {
                        const currentData = serializedData.get(elementJSON.navigator)!.get(elementJSON.event_date)!;

                        currentData!.push(newData);

                        serializedData.get(elementJSON.navigator)!.set(elementJSON.event_date, currentData);
                    } else {
                        serializedData.get(elementJSON.navigator)!.set(elementJSON.event_date, [newData])
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
                    serializedData.set(elementJSON.navigator, [newData])
                }
            }

            return serializedData;
        }
    } 
}

function serializeJobData(data: string[], queryType: DataQuery) {
    if (!([DataQuery.HighestAverageJobMatches, DataQuery.LowestAverageJobMatches].includes(queryType))) {
        if (!([DataQuery.AverageSurveyMatches, DataQuery.SurveyPositiveJobMatches, DataQuery.SurveyNegativeJobMatches].includes(queryType))) {
            if (([DataQuery.TotalJobMatches, DataQuery.PositiveJobMatches, DataQuery.NegativeJobMatches].includes(queryType))) {
                // date -> {job title, count}

                const serializedData = new Map<string, SerializedEntry>();

                for (const element of data) {
                    const elementJSON = JSON.parse(element);

                    const frequency = (elementJSON.frequency == undefined) ? 0 : elementJSON.frequency;

                    serializedData.set(elementJSON.event_date, { jobName: elementJSON.job_title, matchFrequency: frequency });
                }

                return serializedData;
            } else {
                // date -> {job title, score}

                const serializedData = new Map<string, SerializedEntry>();

                for (const element of data) {
                    const elementJSON = JSON.parse(element);

                    const score = (elementJSON.average_score == undefined) ? 0 : elementJSON.average_score;

                    serializedData.set(elementJSON.event_date, { jobName: elementJSON.job_title, score: score });
                }

                return serializedData;
            }
        } else {
            if (([DataQuery.SurveyPositiveJobMatches, DataQuery.SurveyNegativeJobMatches].includes(queryType))) {
                // date -> {survey title, count}
                console.log("here");
                const serializedData = new Map<string, SerializedEntry[]>();

                for (const element of data) {
                    const elementJSON = JSON.parse(element);
                    const frequency = (elementJSON.frequency == undefined) ? 0 : elementJSON.frequency;
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
                    const score = (elementJSON.average_score == undefined) ? 0 : elementJSON.average_score;
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

            const score = (elementJSON.average_score == undefined) ? 0 : elementJSON.average_score;

            serializedData.push({ jobName: elementJSON.job_title, score: score });
        }

        return serializedData;
    }   
}