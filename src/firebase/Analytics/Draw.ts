import { getQueryData } from "./Query";
import { DataQuery, Chart, SerializedEntry, stringifyDate } from "./Utility";

export async function drawChart(selectedSurveys: string[], chartType: Chart, queryType: DataQuery, allNavigators: boolean, forDay: boolean, selectedDate: string, selectedNavigators?: string[]) {
    console.log(selectedDate);
    
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

async function drawTitlesPerDay(queryType: DataQuery, chartType: Chart, selectedSurveys: string[], allNavigators: boolean, forDay: boolean, selectedDate: string, selectedNavigators?: string[]) {
    var data: any
    
    if (!allNavigators) {
        data = await getQueryData(queryType, forDay, selectedDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(queryType, forDay, selectedDate);
    }

    const title = `Total for Selected Surveys Administered ${forDay ? `On ${stringifyDate(selectedDate)}` : "Over the Past 7 Days"}`;

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

function prepareTitles(data: SerializedEntry[]) {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Survey Title");
    chartData.addColumn("number", "Total Administrations");

    for (const element of data) {
        chartData.addRow([element.title, element.frequency]);
    }

    return chartData;
}