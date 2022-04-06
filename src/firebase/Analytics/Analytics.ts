import { analyticsInstance } from "../Firebase";
import { logEvent } from "@firebase/analytics";
import { getAdministeredSurveyData } from "../Firebase";

const queryFunctions = [
    "get_all_title_day",
    "get_all_day",
    "get_all_titles",
    "get_each_title_day",
    "get_each_day",
    "get_each_titles",
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

export async function getQueryData(queryType: DataQuery, navigatorEmail?: string) {
    try {
        const queryFunction = queryFunctions[queryType];
        const navigatorFlag = queryFunction.includes("navigator");
        const queryString = `SELECT * FROM analytics_305371849.${queryFunctions[queryType]}(${navigatorFlag ? navigatorEmail : ""})`;

        const response = await getAdministeredSurveyData({ queryString: queryString, navigatorEmail: navigatorEmail });

        var serializeFilter;

        if (queryFunction.includes("title_day")) {
            serializeFilter = 0;
        } else if (queryFunction.includes("day")) {
            serializeFilter = 1;
        } else {
            serializeFilter = 2;
        }
        
        return serializeQueryData(response.data as string[], queryType);
    } catch (error) {
        const { details } = JSON.parse(JSON.stringify(error));

        return details;
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

            console.log(serializedData);

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

                if (serializedData.has(elementJSON.administering_navigator)) {
                    const currentMap = serializedData.get(elementJSON.administering_navigator);

                    if (currentMap!.has(elementJSON.event_date)) {
                        const currentData = serializedData.get(elementJSON.administering_navigator)!.get(elementJSON.event_date)!;

                        currentData!.push(newData);

                        serializedData.get(elementJSON.administering_navigator)!.set(elementJSON.event_date, currentData);
                    } else {
                        serializedData.get(elementJSON.administering_navigator)!.set(elementJSON.event_date, [newData])
                    }
                } else {
                    const newMap = new Map<string, SerializedEntry[]>();

                    newMap.set(elementJSON.event_date, [newData]);

                    serializedData.set(elementJSON.administering_navigator, newMap);
                }
            }

            return serializedData;
        } else {
            const serializedData = new Map<string, SerializedEntry[]>();

            for (const element of data) {
                const elementJSON = JSON.parse(element);
                const newData = { title: elementJSON.survey_title, frequency: elementJSON.frequency } as SerializedEntry;

                if (serializedData.has(elementJSON.administering_navigator)) {
                    serializedData.get(elementJSON.administering_navigator)!.push(newData);
                } else {
                    serializedData.set(elementJSON.administering_navigator, [newData])
                }
            }

            return serializedData;
        }
    } 
}