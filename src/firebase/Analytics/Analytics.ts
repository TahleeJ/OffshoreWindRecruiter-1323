import { analyticsInstance } from "../Firebase";
import { logEvent } from "@firebase/analytics";
import { getAdministeredSurveyData } from "../Firebase";

const queryFunctions = [
    "get_all_title_day",
    "get_all_day",
    "get_all_titles",
    "get_navigator_title_day",
    "get_navigator_day",
    "get_navigator_titles",
    "get_navigator_title_day",
    "get_navigator_day",
    "get_navigator_titles"
];

export enum DataQuery {
    AllTitlesPerDay = 0,
    AllPerDay = 1,
    AllTitles = 2,
    EachTitlesPerDay = 3,
    EachPerDay = 4,
    EachTitles = 5,
    OneTitlesPerDay = 6,
    OnePerDay = 7,
    OneTitles = 8,
    None = 9
}

export interface SerializedEntry {
    title?: string
    frequency: number
}

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

        console.log("administered!");
}

export async function getQueryData(queryType: DataQuery, selectedNavigator?: string) {
    const queryFunction = queryFunctions[queryType];
    var response;

    if (!([DataQuery.AllTitlesPerDay, DataQuery.AllPerDay, DataQuery.AllTitles].includes(queryType))) {
        const queryString = `SELECT * FROM analytics_305371849.${queryFunction}(${selectedNavigator})`;

        response = await getAdministeredSurveyData({ queryString: queryString, navigatorEmail: selectedNavigator });
    } else {
        const queryString = `SELECT * FROM analytics_305371849.${queryFunction}()`;

        response = await getAdministeredSurveyData({ queryString: queryString });
    }
    
    return serializeQueryData(response.data as string[], queryType);
}

    // TitleDay
    // date -> {title, frequency}
    // 
    // PerDay
    // date -> {frequency}
    //
    // Titles
    // {title, frequency}

export function serializeQueryData(data: string[], queryType: DataQuery) {
    if ([DataQuery.AllTitlesPerDay, DataQuery.AllPerDay, DataQuery.AllTitles].includes(queryType)) {
        if (queryType !== DataQuery.AllTitles) {
            const serializedData = new Map<string, SerializedEntry[]>();

            // TitleDay & PerDay
            for (const element of data) {
                const elementJSON = JSON.parse(element);
                const newData = { frequency: elementJSON.frequency } as SerializedEntry;

                if (queryType % 3 === 0) {
                    newData.title = elementJSON.survey_title;
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

                serializedData.push({ title: elementJSON.survey_title, frequency: elementJSON.frequency } as SerializedEntry);
            }

            return serializedData;
        }
    } else {
        if (!([DataQuery.EachTitles, DataQuery.OneTitles].includes(queryType))) {
            const serializedData = new Map<string, Map<string, SerializedEntry[]>>();

            for (const element of data) {
                const elementJSON = JSON.parse(element);
                const newData = { frequency: elementJSON.frequency } as SerializedEntry;

                if (queryType % 3 === 0) {
                    newData.title = elementJSON.survey_title;
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
                const newData = { title: elementJSON.survey_title, frequency: elementJSON.frequency } as SerializedEntry;

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