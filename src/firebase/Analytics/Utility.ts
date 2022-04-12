// List of query functions recognized by BigQuery
export const queryFunctions = [
    "get_all_title_day",
    "get_all_day",
    "get_all_titles",
    "get_each_title_day",
    "get_each_day",
    "get_each_titles",
    "get_navigator_title_day",
    "get_navigator_day",
    "get_navigator_titles",
    "get_total_job",
    "get_positive_job",
    "get_negative_job",
    "get_average_job",
    "get_highest_average_job",
    "get_lowest_average_job",
    "get_average_survey",
    "get_positive_survey",
    "get_negative_survey"
];

// List of query functions in a more operational format
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
    TotalJobMatches = 9,
    PositiveJobMatches = 10,
    NegativeJobMatches = 11,
    AverageJobMatches = 12,
    HighestAverageJobMatches = 13,
    LowestAverageJobMatches = 14,
    AverageSurveyMatches = 15,
    SurveyPositiveJobMatches = 16,
    SurveyNegativeJobMatches = 17,
    None = 18
}

export enum NavigatorGrouping {
    All = 0,
    Set = 1,
    One = 2
}

export enum Subject {
    Surveys = 0,
    Jobs = 1
}

export enum DateGrouping {
    Week = 0,
    Day = 1,
    Month = 2,
    Since = 3
}

export enum Chart {
    Pie = 0,
    Combo = 1,
    Line = 2,
    Bar = 3,
    Table = 4,
    TreeMap = 5,
    None = 6
}

export interface SerializedEntry {
    surveyTitle?: string
    surveyFrequency?: number,
    jobName?: string,
    matchFrequency?: number,
    score?: number
}

export const dataFocusTypes = {
    surveys: {
        titleDay: {
            name: "TitleDay",
            text: "Each selected survey per day"
        },
        perDay: {
            name: "PerDay",
            text: "All surveys per day"
        },
        titles: {
            name: "Titles",
            text: "All surveys"
        }
    }, 
    jobs: {
        totalPerJob: {
            name: "TotalMatches",
            text: "Total matches for each selected job"
        },
        totalPositivePerJob: {
            name: "TotalPositive",
            text: "Total positive matches of each selected job"
        },
        totalNegativePerJob: {
            name: "TotalNegative",
            text: "Total negative matches of each selected job"
        },
        averagePerJob: {
            name: "JobAverage",
            text: "Average score of each selected job"
        },
        highestAverage: {
            name: "HighestAverageJob",
            text: "10 highest scoring jobs"
        },
        lowestAverage: {
            name: "LowestAverageJob",
            text: "10 lowest scoring jobs"
        },
        averagePerSurvey: {
            name: "SurveyAverage",
            text: "Average score for each selected survey"
        },
        totalPositivePerSurvey: {
            name: "SurveyTotalPositive",
            text: "Total positive matches for each selected survey"
        },
        totalNegativePerSurvey: {
            name: "SurveTotalNegative",
            text: "Total negative matches for each selected survey"
        }
    }
};

// List of data focuses (sets) able to be represented by each chart type
export const validQueryCharts = {
    surveys: {
        pie: {
            list: [DataQuery.AllTitles, DataQuery.OneTitles, DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay], // EachTitles
            text: `${dataFocusTypes.surveys.titleDay.text}\n${dataFocusTypes.surveys.titles.text}`
        }, 
        combo: {
            list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay],
            text: `${dataFocusTypes.surveys.titleDay.text}`
        },
        line: {
            list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay, DataQuery.AllPerDay, DataQuery.OnePerDay],
            text: `${dataFocusTypes.surveys.titleDay.text}\n${dataFocusTypes.surveys.perDay.text}`
        },
        bar: {
            list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay, DataQuery.AllPerDay, DataQuery.OnePerDay], // EachTitles, EachPerDay
            text: `${dataFocusTypes.surveys.titleDay.text}\n${dataFocusTypes.surveys.perDay.text}`
        },
        table: {
            text: 'All focuses are valid for this chart type.'
        }
    },
    jobs: {
        pie: {
            list: [DataQuery.TotalJobMatches, DataQuery.PositiveJobMatches, DataQuery.NegativeJobMatches, DataQuery.SurveyPositiveJobMatches, DataQuery.SurveyNegativeJobMatches],
            text: `${dataFocusTypes.jobs.totalPerJob.text}\n${dataFocusTypes.jobs.totalPositivePerJob.text}\n${dataFocusTypes.jobs.totalNegativePerJob.text}\n${dataFocusTypes.jobs.totalPositivePerSurvey.text}\n${dataFocusTypes.jobs.totalNegativePerSurvey.text}`
        },
        line: {
            list: [DataQuery.TotalJobMatches, DataQuery.PositiveJobMatches, DataQuery.NegativeJobMatches, DataQuery.AverageJobMatches, DataQuery.AverageSurveyMatches, DataQuery.SurveyPositiveJobMatches, DataQuery.SurveyNegativeJobMatches],
            text: `${dataFocusTypes.jobs.totalPerJob.text}\n${dataFocusTypes.jobs.totalPositivePerJob.text}\n${dataFocusTypes.jobs.totalNegativePerJob.text}\n${dataFocusTypes.jobs.averagePerJob.text}\n${dataFocusTypes.jobs.averagePerSurvey.text}\n${dataFocusTypes.jobs.totalPositivePerSurvey.text}\n${dataFocusTypes.jobs.totalNegativePerSurvey.text}`
        },
        bar: {
            text: 'All focuses are valid for this chart type.'
        },
        table: {
            text: 'All focuses are valid for this chart type.'
        },
        treemap: {
            list: [DataQuery.HighestAverageJobMatches, DataQuery.LowestAverageJobMatches],
            text: `${dataFocusTypes.jobs.highestAverage.text}\n${dataFocusTypes.jobs.lowestAverage.text}`
        },
    }
}

/**
 * Turns the BigQuery provided dates into a more readable format
 * 
 * @param date the event date sent back from BigQuery
 * @returns the human-friendly date format
 */
export function stringifyDate(date: string): string {
    const month = date.substring(4, 6);
    const day = date.substring(6);
    const year = date.substring(0, 4);

    const newDate = `${month}/${day}/${year}`;

    return newDate;
}

export const today = () => {
    const todayDate = new Date();
    const day = String(todayDate.getDate()).padStart(2, '0');
    const month = String(todayDate.getMonth() + 1).padStart(2, '0');
    const year = todayDate.getFullYear();

    const todayString = `${year}-${month}-${day}`;

    return todayString;
}

/*
1 - 4/11
2 - 4/10
3 - 4/9
4 - 4/8
5 - 4/7
6 - 4/6
7 - 4/5

1 - 1/4
2 - 1/3
3 - 1/2
4 - 1/1
5 - 12/31
6 - 12/30
7 - 12/29
*/

function getPastStart(dayDifference: number) {
    const tempToday = today().replaceAll("-", "");
    const tempYear = parseInt(tempToday.substring(0, 4));
    const tempMonth = parseInt(tempToday.substring(4, 6));
    const tempDay = parseInt(tempToday.substring(6));

    var pastYear = tempYear;
    var pastMonth = tempMonth;
    var pastDay = tempDay;

    var difference = pastDay - dayDifference;

    if (difference <= 0) {
        pastDay = 31 + difference;
        pastMonth--;

        if (pastMonth == 0) {
            pastMonth = 12;
            pastYear--;
        }
    } else {
        pastDay = difference;
    }

    const startDate = `${pastYear}${((pastMonth < 10) ? "0" : "") + pastMonth}${((pastDay < 10) ? "0" : "") + pastDay}`;

    return startDate;
}

export function determineStartDate(dateGrouping: DateGrouping, dayDate: string, sinceDate: string) {
    var startDate;

    switch (dateGrouping) {
        case DateGrouping.Day:
            startDate = dayDate;
            break;
        case DateGrouping.Week:
            startDate = getPastStart(6);
            break;
        case DateGrouping.Month:
            startDate = getPastStart(30);
            break;
        case DateGrouping.Since:
            startDate = sinceDate;
            break;
    }

    return startDate;
}

/**
 * Determines the type of query that will be sent to BigQuery
 * 
 * @param dataFocusEntry the desired data focus (set)
 * @param navigatorGroupingEntry the desired navigator(s) to see data for
 * @returns the type of data query to be sent out
 */
export function determineQueryType(subject: Subject, dataFocusEntry: string, navigatorGroupingEntry: NavigatorGrouping): DataQuery {
    var chartQueryType: DataQuery;

    switch (subject) {
        case Subject.Surveys:
            switch (navigatorGroupingEntry) {
                case NavigatorGrouping.All:
                    switch(dataFocusEntry) {
                        case dataFocusTypes.surveys.titleDay.name:
                            chartQueryType = DataQuery.AllTitlesPerDay;
                            break;
                        case dataFocusTypes.surveys.perDay.name:
                            chartQueryType = DataQuery.AllPerDay;
                            break;
                        case dataFocusTypes.surveys.titles.name:
                            chartQueryType = DataQuery.AllTitles;
                            break;
                        default:
                            break;
                    }
                    break;
                case NavigatorGrouping.Set:
                    switch(dataFocusEntry) {
                        case dataFocusTypes.surveys.titleDay.name:
                            chartQueryType = DataQuery.None;
                            break;
                        case dataFocusTypes.surveys.perDay.name:
                            chartQueryType = DataQuery.EachPerDay;
                            break;
                        case dataFocusTypes.surveys.titles.name:
                            chartQueryType = DataQuery.EachTitles;
                            break;
                        default:
                            break;
                    }
                    break;
                case NavigatorGrouping.One:
                    switch(dataFocusEntry) {
                        case dataFocusTypes.surveys.titleDay.name:
                            chartQueryType = DataQuery.OneTitlesPerDay;
                            break;
                        case dataFocusTypes.surveys.perDay.name:
                            chartQueryType = DataQuery.OnePerDay;
                            break;
                        case dataFocusTypes.surveys.titles.name:
                            chartQueryType = DataQuery.OneTitles;
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            break;
        case Subject.Jobs:
            switch (dataFocusEntry) {
                case dataFocusTypes.jobs.totalPerJob.name:
                    chartQueryType = DataQuery.TotalJobMatches;
                    break;
                case dataFocusTypes.jobs.totalPositivePerJob.name:
                    chartQueryType = DataQuery.PositiveJobMatches;
                    break;
                case dataFocusTypes.jobs.totalNegativePerJob.name:
                    chartQueryType = DataQuery.NegativeJobMatches;
                    break;
                case dataFocusTypes.jobs.averagePerJob.name:
                    chartQueryType = DataQuery.AverageJobMatches;
                    break;
                case dataFocusTypes.jobs.highestAverage.name:
                    chartQueryType = DataQuery.HighestAverageJobMatches;
                    break;
                case dataFocusTypes.jobs.lowestAverage.name:
                    chartQueryType = DataQuery.LowestAverageJobMatches;
                    break;
                case dataFocusTypes.jobs.averagePerSurvey.name:
                    chartQueryType = DataQuery.AverageSurveyMatches;
                    break;
                case dataFocusTypes.jobs.totalPositivePerSurvey.name:
                    chartQueryType = DataQuery.SurveyPositiveJobMatches;
                    break;
                case dataFocusTypes.jobs.totalNegativePerSurvey.name:
                    chartQueryType = DataQuery.SurveyNegativeJobMatches;
                    break;
            }

            break;
    }


    return chartQueryType!;
}

/**
 * Validates that the selected chart type is able to represent the selected
 * data focus (set)
 * 
 * @param chartType the desired chart type
 * @param queryType the desired data focus
 * @returns whether the desired chart is able to represent the desired data focus
 */
export function validateChartType(subject: Subject, chartType: Chart, queryType: DataQuery): boolean {
    var validChartType: boolean;

    switch (subject) {
        case Subject.Surveys:
            switch(chartType!) {
                case Chart.Pie:
                    validChartType = validQueryCharts.surveys.pie.list.includes(queryType);
                    break;
                case Chart.Combo:
                    validChartType = validQueryCharts.surveys.combo.list.includes(queryType);
                    break;
                case Chart.Line:
                    validChartType = validQueryCharts.surveys.line.list.includes(queryType);
                    break;
                case Chart.Bar:
                    validChartType = validQueryCharts.surveys.bar.list.includes(queryType);
                    break;
                case Chart.Table:
                    validChartType = true;
                    break;
                default:
                    break;
            }
            break;
        case Subject.Jobs:
            switch(chartType!) {
                case Chart.Pie:
                    validChartType = validQueryCharts.jobs.pie.list.includes(queryType);
                    break;
                case Chart.Line:
                    validChartType = validQueryCharts.jobs.line.list.includes(queryType);
                    break;
                case Chart.Bar:
                    validChartType = true;
                    break;
                case Chart.Table:
                    validChartType = true;
                    break;
                case Chart.TreeMap:
                    validChartType = validQueryCharts.jobs.treemap.list.includes(queryType);
                    break;
                default:
                    break;
            }
            break;
    }

    return validChartType!;
}