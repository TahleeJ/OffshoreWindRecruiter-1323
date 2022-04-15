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
    "get_negative_survey",
    "get_all_label",
    "get_average_label"
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
    LabelPoints = 18,
    LabelAverage = 19,
    None = 20
}

export enum NavigatorGrouping {
    All = 0,
    Set = 1,
    One = 2
}

export enum Subject {
    Surveys = 0,
    Jobs = 1,
    Labels = 2
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
    Scatter = 6,
    None = 7
}

export interface SelectionArrays {
    navigators?: string[],
    surveys?: string[],
    jobs?: string[],
    labels?: string[]
}

export interface DateSelection {
    forDay: boolean,
    startDate: string
}

export interface SerializedEntry {
    surveyTitle?: string
    surveyFrequency?: number,
    jobName?: string,
    matchFrequency?: number,
    score?: number,
    labelName?: string,
    labelFrequency?: number,
    linearScore?: number,
    percentileScore?: number
}

export interface ValidChart {
    list: DataQuery[],
    text: string
}

export const dataFocusTypes = {
    surveys: {
        titleDay: "Each selected survey per day",
        perDay: "All surveys per day",
        titles: "All surveys"
    }, 
    jobs: {
        totalPerJob: "Total matches for each selected job",
        totalPositivePerJob: "Total positive matches of each selected job",
        totalNegativePerJob: "Total negative matches of each selected job",
        averagePerJob: "Average score of each selected job",
        highestAverage: "10 highest scoring jobs",
        lowestAverage: "10 lowest scoring jobs",
        averagePerSurvey: "Average score for each selected survey",
        totalPositivePerSurvey: "Total positive matches for each selected survey",
        totalNegativePerSurvey: "Total negative matches for each selected survey"
    },
    labels : {
        allPoints: "Each linear/percentile score occurrence for the selected label",
        average: "Each linear/percentile average for each selected label"
    }
};

const allDataQueries: DataQuery[] = Object.keys(DataQuery)
    .filter((value) => !isNaN(Number(value)))
    .map((value) => parseInt(value));

export const validChartInfo = new Map<Subject, Map<Chart, ValidChart>>();

// Valid charts for survey subject
const surveyValidChartMap = new Map<Chart, ValidChart>();

surveyValidChartMap.set(Chart.Pie, {
    list: [
        DataQuery.AllTitles, 
        DataQuery.OneTitles, 
        DataQuery.AllTitlesPerDay, 
        DataQuery.OneTitlesPerDay],
    text: `${dataFocusTypes.surveys.titleDay}\n` +
        `${dataFocusTypes.surveys.titles}`
});
surveyValidChartMap.set(Chart.Combo, {
    list: [
        DataQuery.AllTitlesPerDay, 
        DataQuery.OneTitlesPerDay],
    text: `${dataFocusTypes.surveys.titleDay}`
});
surveyValidChartMap.set(Chart.Line, {
    list: [
        DataQuery.AllTitlesPerDay, 
        DataQuery.OneTitlesPerDay, 
        DataQuery.AllPerDay, 
        DataQuery.OnePerDay],
    text: `${dataFocusTypes.surveys.titleDay}\n` +
        `${dataFocusTypes.surveys.perDay}`
});
surveyValidChartMap.set(Chart.Bar, {
    list: [
        DataQuery.AllTitlesPerDay,
        DataQuery.OneTitlesPerDay, 
        DataQuery.AllPerDay, 
        DataQuery.OnePerDay],
    text: `${dataFocusTypes.surveys.titleDay}\n` +
        `${dataFocusTypes.surveys.perDay}`
});
surveyValidChartMap.set(Chart.Table, {
    list: allDataQueries,
    text: 'All focuses are valid for this chart type.'
});

// Valid charts for job subject
const jobValidChartMap = new Map<Chart, ValidChart>();

jobValidChartMap.set(Chart.Pie, {
    list: [
        DataQuery.TotalJobMatches, 
        DataQuery.PositiveJobMatches, 
        DataQuery.NegativeJobMatches, 
        DataQuery.SurveyPositiveJobMatches, 
        DataQuery.SurveyNegativeJobMatches],
    text: `${dataFocusTypes.jobs.totalPerJob}\n` +
        `${dataFocusTypes.jobs.totalPositivePerJob}\n` +
        `${dataFocusTypes.jobs.totalNegativePerJob}\n` +
        `${dataFocusTypes.jobs.totalPositivePerSurvey}\n` +
        `${dataFocusTypes.jobs.totalNegativePerSurvey}`
});
jobValidChartMap.set(Chart.Line, {
    list: [
        DataQuery.TotalJobMatches, 
        DataQuery.PositiveJobMatches, 
        DataQuery.NegativeJobMatches, 
        DataQuery.AverageJobMatches, 
        DataQuery.AverageSurveyMatches, 
        DataQuery.SurveyPositiveJobMatches, 
        DataQuery.SurveyNegativeJobMatches],
    text: `${dataFocusTypes.jobs.totalPerJob}\n` +
        `${dataFocusTypes.jobs.totalPositivePerJob}\n` +
        `${dataFocusTypes.jobs.totalNegativePerJob}\n` +
        `${dataFocusTypes.jobs.averagePerJob}\n` +
        `${dataFocusTypes.jobs.averagePerSurvey}\n` +
        `${dataFocusTypes.jobs.totalPositivePerSurvey}\n` +
        `${dataFocusTypes.jobs.totalNegativePerSurvey}`
});
jobValidChartMap.set(Chart.Bar, {
    list: allDataQueries,
    text: 'All focuses are valid for this chart type.'
});
jobValidChartMap.set(Chart.Table, {
    list: allDataQueries,
    text: 'All focuses are valid for this chart type.'
});
jobValidChartMap.set(Chart.TreeMap, {
    list: [
        DataQuery.HighestAverageJobMatches, 
        DataQuery.LowestAverageJobMatches],
    text: `${dataFocusTypes.jobs.highestAverage}\n` +
        `${dataFocusTypes.jobs.lowestAverage}`
});

// Valid charts for label subject
const labelValidChartMap = new Map<Chart, ValidChart>();

labelValidChartMap.set(Chart.Line, {
    list: [
        DataQuery.LabelAverage],
    text: `${dataFocusTypes.labels.average}`
});
labelValidChartMap.set(Chart.Bar, {
    list: [
        DataQuery.LabelAverage],
    text: `${dataFocusTypes.labels.average}`
});
labelValidChartMap.set(Chart.Table, {
    list: allDataQueries,
    text: 'All focuses are valid for this chart type.'
});
labelValidChartMap.set(Chart.Scatter, {
    list: [
        DataQuery.LabelPoints],
    text: `${dataFocusTypes.labels.allPoints}`
});

validChartInfo.set(Subject.Surveys, surveyValidChartMap);
validChartInfo.set(Subject.Jobs, jobValidChartMap);
validChartInfo.set(Subject.Labels, labelValidChartMap);

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

        if (pastMonth === 0) {
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