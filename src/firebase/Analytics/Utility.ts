export const queryFunctions = [
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

export enum NavigatorGrouping {
    All = 0,
    Set = 1,
    One = 2
}

export enum Chart {
    Pie = 0,
    Combo = 1,
    Line = 2,
    Bar = 3
}

export interface SerializedEntry {
    title?: string
    frequency: number
}

export const dataFocusTypes = {
    titleday: "TitleDay",
    perday: "PerDay",
    titles: "Titles"
};

export const validQueryCharts = {
    pie: {
        list: [DataQuery.AllTitles, DataQuery.OneTitles, DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay], // EachTitles
        text: "Total administration of all surveys<br />Administration total of each selected survey over the past week"
    }, 
    combo: {
        list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay],
        text: "Administration total of each selected survey over the past week"
    },
    line: {
        list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay, DataQuery.AllPerDay, DataQuery.OnePerDay],
        text: "Administration total of each selected survey over the past week<br />Administration total of all surveys over the past week"
    },
    bar: {
        list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay, DataQuery.AllTitles, DataQuery.OneTitles, DataQuery.AllPerDay, DataQuery.OnePerDay], // EachTitles, EachPerDay
        text: 'Administration total of each selected survey over the past week<br />Administration total of all surveys over the past week<br />Total administration of all surveys'
    }
}

export function determineQueryType(dataFocusEntry: string, navigatorGroupingEntry: NavigatorGrouping): DataQuery {
    var chartQueryType: DataQuery;

    switch(navigatorGroupingEntry) {
        case NavigatorGrouping.All:
            switch(dataFocusEntry) {
                case dataFocusTypes.titleday:
                    chartQueryType = DataQuery.AllTitlesPerDay;
                    break;
                case dataFocusTypes.perday:
                    chartQueryType = DataQuery.AllPerDay;
                    break;
                case dataFocusTypes.titles:
                    chartQueryType = DataQuery.AllTitles;
                    break;
                default:
                    break;
            }
            break;
        case NavigatorGrouping.Set:
            switch(dataFocusEntry) {
                case dataFocusTypes.titleday:
                    chartQueryType = DataQuery.None;
                    break;
                case dataFocusTypes.perday:
                    chartQueryType = DataQuery.EachPerDay;
                    break;
                case dataFocusTypes.titles:
                    chartQueryType = DataQuery.EachTitles;
                    break;
                default:
                    break;
            }
            break;
        case NavigatorGrouping.One:
            switch(dataFocusEntry) {
                case dataFocusTypes.titleday:
                    chartQueryType = DataQuery.OneTitlesPerDay;
                    break;
                case dataFocusTypes.perday:
                    chartQueryType = DataQuery.OnePerDay;
                    break;
                case dataFocusTypes.titles:
                    chartQueryType = DataQuery.OneTitles;
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }

    return chartQueryType!;
}

export function validateChartType(chartType: Chart, queryType: DataQuery): boolean {
    var validChartType: boolean;

    switch(chartType!) {
        case Chart.Pie:
            validChartType = validQueryCharts.pie.list.includes(queryType);
            break;
        case Chart.Combo:
            validChartType = validQueryCharts.combo.list.includes(queryType);
            break;
        case Chart.Line:
            validChartType = validQueryCharts.line.list.includes(queryType);
            break;
        case Chart.Bar:
            validChartType = validQueryCharts.bar.list.includes(queryType);
            break;
        default:
            break;
    }

    return validChartType!;
}