import { getQueryData } from "./Query";
import { DataQuery, Chart, SerializedEntry, stringifyDate } from "./Utility";

/**
 * Function to begin the actual chart drawing process based on the desired representation parameters
 * 
 * @param selectedSurveys the desired surveys to see data for
 * @param chartType the desired (chart) representation of the data
 * @param queryType the type of query to focus the data
 * @param allNavigators whether the data should focus on all navigators
 * @param forDay whether the data should focus on a single, specified day
 * @param selectedDate the desired day to see data for
 * @param selectedNavigators the specific navigator(s) to see data for
 */
export async function drawChart(selectedSurveys: string[], chartType: Chart, queryType: DataQuery, allNavigators: boolean, forDay: boolean, selectedDate: string, selectedNavigators?: string[]) {
    switch(queryType) {
        case DataQuery.AllTitlesPerDay:
            drawTitlesPerDay(queryType, chartType, selectedSurveys, allNavigators, forDay, selectedDate);
            break;
        case DataQuery.AllPerDay:
            drawPerDay(queryType, chartType, allNavigators, forDay, selectedDate);
            break;
        case DataQuery.AllTitles:
            drawTitles(queryType, chartType, allNavigators, forDay, selectedDate);   
            break;
        case DataQuery.EachTitlesPerDay:
            break;
        case DataQuery.EachPerDay:
            break;
        case DataQuery.EachTitles:
            break;
        case DataQuery.OneTitlesPerDay:
            drawTitlesPerDay(queryType, chartType, selectedSurveys, allNavigators, forDay, selectedDate, selectedNavigators);
            break;
        case DataQuery.OnePerDay:
            drawPerDay(queryType, chartType, allNavigators, forDay, selectedDate, selectedNavigators);
            break;
        case DataQuery.OneTitles:
            drawTitles(queryType, chartType, allNavigators, forDay, selectedDate, selectedNavigators); 

            break;
    }
}

/**
 * Chart drawing function to handle viewing data for a desired set of surveys over the 
 * time span of a week/day.
 * 
 * @param queryType the type of query to focus the data on
 * @param chartType the desired representation of the data
 * @param selectedSurveys the desired set of surveys to see data for
 * @param allNavigators whether the data should focus on all navigators
 * @param forDay whether the data should focus on a single, specified day
 * @param selectedDate the desired day to see data for
 * @param selectedNavigators the desired set of navigator(s) to see data for
 */
async function drawTitlesPerDay(queryType: DataQuery, chartType: Chart, selectedSurveys: string[], allNavigators: boolean, forDay: boolean, selectedDate: string, selectedNavigators?: string[]) {
    var data: any
    
    // Retrieve data from BigQuery
    if (!allNavigators) {
        data = await getQueryData(queryType, forDay, selectedDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(queryType, forDay, selectedDate);
    }

    const title = `Total for Selected Surveys Administered ${forDay ? `On ${stringifyDate(selectedDate)}` : "Over the Past 7 Days"}`;

    // Chart drawing using transformed BigQuery data
    var chartData: google.visualization.DataTable;

    if (chartType === Chart.Combo) {
        chartData = prepareTitlesPerDay(selectedSurveys, (!allNavigators ? data.get(selectedNavigators![0]) : data), true, false);

        var seriesOptions = [];
        var tempCounter = 0;
    
        while (tempCounter < selectedSurveys.length) {
            seriesOptions.push({});
    
            tempCounter++;
        }
    
        seriesOptions.push({type: 'line'});

        new google.visualization.ComboChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Surveys Administered'},
                hAxis: {title: 'Day'},
                seriesType: 'bars',
                series: seriesOptions
            });
    } else if (chartType === Chart.Line) {
        chartData = prepareTitlesPerDay(selectedSurveys, (!allNavigators ? data.get(selectedNavigators![0]) : data), false, false);

        new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Surveys Administered'},
                hAxis: {title: 'Day'}
            });
    } else if (chartType === Chart.Bar) {
        chartData = prepareTitlesPerDay(selectedSurveys, (!allNavigators ? data.get(selectedNavigators![0]) : data), false, false);

        new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Day'},
                hAxis: {title: 'Surveys Administered'},
                isStacked: true
            });
    } else if (chartType === Chart.Pie) {
        chartData = prepareTitlesPerDay(selectedSurveys, (!allNavigators ? data.get(selectedNavigators![0]) : data), false, true);

        new google.visualization.PieChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                pieSliceText: "percentage"
            });
    }

}

/**
 * Converts the data received from BigQuery into a format recognized by Google Charts
 * 
 * *Converts data particularly for a set of surveys over the time span of a week/day
 * 
 * @param selectedSurveys the desired surveys to see data for
 * @param data the transformed data received from BigQuery
 * @param includeAverage whether to calculate (and include) an average line in the data set
 * @param total whether to calculate the total appearance of the desired surveys per week instead of per day
 * @returns the Google Chart-recognizable set of data
 */
function prepareTitlesPerDay(selectedSurveys: string[], data: Map<string, SerializedEntry[]>, includeAverage: boolean, total: boolean): google.visualization.DataTable {
    var chartData = new google.visualization.DataTable();

    var dateCounter = 0;     

    if (!total) {
        var eachSurveyList: Map<string, number>[] = [];
        var surveyFrequency: [any[]] = [[]];
        var indices: number[] = [];
        var addList = [];

        chartData.addColumn("string", "Date");

        selectedSurveys.forEach((surveyName) => {
            chartData.addColumn("number", surveyName);
        });

        for (const [key, value] of data) {
            if (dateCounter < 7 && dateCounter < data.size) {
                const date = stringifyDate(key);
                surveyFrequency[dateCounter] = [date];
    
                // survey name -> {frequency}
                var surveyMap = new Map<string, number>();
    
                for (const survey of value) {
                    surveyMap.set(survey.title!, survey.frequency);
                }
    
                eachSurveyList[dateCounter] = surveyMap;
    
                dateCounter++;
            } else {
                break;
            }
        }

        // Temporary until enough 7-day data is gathered
        var temp = 0;

        while (temp < dateCounter) {
            indices.push(temp);

            temp++;
        }

        if (includeAverage) {
            chartData.addColumn("number", "Average");
        }

        for (const dateIndex of indices) {
            var sumFrequency = 0;
    
            for (const selectedSurvey of selectedSurveys) {
                const examineList = eachSurveyList[dateIndex];
                var usedFrequency = 0;
    
                if (examineList.has(selectedSurvey)) {
                    usedFrequency = examineList.get(selectedSurvey)!;
                    surveyFrequency[dateIndex].push(usedFrequency);
                } else {
                    surveyFrequency[dateIndex].push(usedFrequency);
                }
    
                sumFrequency += usedFrequency;
            }
    
            if (includeAverage) {
                const average = sumFrequency / selectedSurveys.length;
                surveyFrequency[dateIndex].push(average);
            }
    
            addList.unshift(surveyFrequency[dateIndex]);
        }

        chartData.addRows(addList);
    } else {
        var eachSurveyTotal: Map<string, number> = new Map<string, number>();

        selectedSurveys.forEach((surveyName) => {
            eachSurveyTotal.set(surveyName, 0);
        });

        chartData.addColumn("string", "Survey Administered");
        chartData.addColumn("number", "Frequency");

        for (const [key, value] of data) {
            if (dateCounter < 7 && dateCounter < data.size) {
                for (const survey of value) {
                    var surveyTotal = eachSurveyTotal.get(survey.title!)!;

                    surveyTotal += survey.frequency;

                    eachSurveyTotal.set(survey.title!, surveyTotal);
                }

                dateCounter++;
            } else {
                break;
            }
        }

        for (const [key, value] of eachSurveyTotal) {
            chartData.addRow([key, value]);
        }
    }

    return chartData;
}

/**
 * Chart drawing function to handle viewing data for all surveys over the time span of a week/day.
 * 
 * @param queryType the type of query to focus the data on
 * @param chartType the desired representation of the data
 * @param allNavigators whether the data should focus on all navigators
 * @param forDay whether the data should focus on a single, specified day
 * @param selectedDate the desired day to see data for
 * @param selectedNavigators the desired set of navigator(s) to see data for
 */
async function drawPerDay(queryType: DataQuery, chartType: Chart, allNavigators: boolean, forDay: boolean, selectedDate: string, selectedNavigators?: string[]) {
    var data: any

    if (!allNavigators) {
        data = await getQueryData(queryType, forDay, selectedDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(queryType, forDay, selectedDate,);
    }

    const title = `Total for All Surveys Administered ${forDay ? `On ${stringifyDate(selectedDate)}` : "Over the Past 7 Days"}`;

    const chartData: google.visualization.DataTable = preparePerDay((!allNavigators ? data.get(selectedNavigators![0]) : data));

    if (chartType === Chart.Line) {
        new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Surveys Administered'},
                hAxis: {title: 'Day'},
              });
    } else if (chartType === Chart.Bar) {
        new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Day'},
                hAxis: {title: 'Surveys Administered'},
                colors: ['grey']
            });
    }
}

/**
 * Converts the data received from BigQuery into a format recognized by Google Charts
 * 
 * *Converts data particularly for all surveys over the time span of a week/day
 * 
 * @param data the transformed data received from BigQuery
 * @returns the Google Chart-recognizable set of data
 */
function preparePerDay(data: Map<string, SerializedEntry[]>): google.visualization.DataTable {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Date");
    chartData.addColumn("number", "Frequency");

    var addList = [];

    var dateCounter = 0;

    for (const [key, value] of data) {
        if (dateCounter < 7 && dateCounter < data.size) {
            const date = stringifyDate(key);
            addList.unshift([date, value[0].frequency]);
        } else {
            break;
        }
    }

    chartData.addRows(addList);

    return chartData;
}

/**
 * Chart drawing function to handle viewing data for each survey over the time span of a year/day.
 * 
 * @param queryType the type of query to focus the data on
 * @param chartType the desired representation of the data
 * @param allNavigators whether the data should focus on all navigators
 * @param forDay whether the data should focus on a single, specified day
 * @param selectedDate the desired day to see data for
 * @param selectedNavigators the desired set of navigator(s) to see data for
 */
async function drawTitles(queryType: DataQuery, chartType: Chart, allNavigators: boolean, forDay: boolean, selectedDate: string, selectedNavigators?: string[]) {
    var data: any
    
    if (!allNavigators) {
        data = await getQueryData(queryType, forDay, selectedDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(queryType, forDay, selectedDate,);
    }

    const title = `Total Surveys Administered ${forDay ? `On ${stringifyDate(selectedDate)}` : "Over the Past 7 Days"}`;

    const chartData = prepareTitles((!allNavigators ? data.get(selectedNavigators![0]) : data));

    if (chartType === Chart.Pie) {
        new google.visualization.PieChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                pieSliceText: "percentage"
            });
    } else if (chartType === Chart.Bar) {
        new google.visualization.BarChart(document.getElementById('chart')!)
        .draw(chartData!, {
            title: title,
            vAxis: {title: 'Survey Administered'},
            hAxis: {title: 'Total'},
            colors: ['grey']
        });
    }   
}

/**
 * Converts the data received from BigQuery into a format recognized by Google Charts
 * 
 * *Converts data particularly for each survey over the time span of a year/day
 * 
 * @param data the transformed data received from BigQuery
 * @returns the Google Chart-recognizable set of data
 */
function prepareTitles(data: SerializedEntry[]) {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Survey Title");
    chartData.addColumn("number", "Total Administrations");

    for (const element of data) {
        chartData.addRow([element.title, element.frequency]);
    }

    return chartData;
}