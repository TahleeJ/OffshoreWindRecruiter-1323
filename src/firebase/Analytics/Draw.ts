import { DataQuery, getQueryData, SerializedEntry } from "./Analytics";

export enum Chart {
    Pie = 0,
    Combo = 1,
    Line = 2,
    Bar = 3
}

export async function drawChart(selectedSurveys: string[], selectedNaviagors: string[], chartType: Chart, queryType: DataQuery, navigatorEmail?: string) {
    const data = await getQueryData(queryType, navigatorEmail);
    var chartData: google.visualization.DataTable;

    switch(queryType) {
        case DataQuery.AllTitlesPerDay:
            chartData = prepareAllTitlesPerDay(selectedSurveys, data);

            var seriesOptions = [];
            var tempCounter = 0;
        
            while (tempCounter < selectedSurveys.length) {
                seriesOptions.push({});
        
                tempCounter++;
            }
        
            seriesOptions.push({type: 'line'});

            if (chartType == Chart.Combo) {
                new google.visualization.ComboChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: 'Administered Survey Frequency Over The Past Week',
                        vAxis: {title: 'Surveys Administered'},
                        hAxis: {title: 'Month'},
                        seriesType: 'bars',
                        series: seriesOptions
                    });
            } else {
                chartData.removeColumn(tempCounter);

                new google.visualization.LineChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: 'Total for Selected Surveys Administered Over the Past 7 Days'
                    });
            }

            break;
        case DataQuery.AllPerDay:
            chartData = prepareAllPerDay(data);

            if (chartType == Chart.Line) {
                new google.visualization.LineChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: 'Total for All Surveys Administered Over the Past 7 Days',
                      });
            } else {
                new google.visualization.BarChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: 'Total for All Surveys Administered Over the Past 7 Days',
                    });
            }

            break;
        case DataQuery.AllTitles:
            chartData = prepareAllTitles(data);
        
            new google.visualization.PieChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: 'Total Surveys Administered',
                    pieSliceText: "percentage"
                });

            break;
    }
}

function prepareAllTitlesPerDay(selectedSurveys: string[], data: Map<string, SerializedEntry[]>): google.visualization.DataTable {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Date");

    var dateCounter = 0;
    var surveyFrequency: [any[]] = [[]];
    var eachSurveyList: Map<string, number>[] = [];
    var indices: number[] = [];
    var addList = [];

    selectedSurveys.forEach((surveyName) => {
        chartData.addColumn("number", surveyName);
    })

    for (const [key, value] of data) {
        if (dateCounter < 7 && dateCounter < data.size) {
            surveyFrequency[dateCounter] = [key];

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

    chartData.addColumn("number", "Average");

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

        const average = sumFrequency / selectedSurveys.length;
        surveyFrequency[dateIndex].push(average);

        addList.unshift(surveyFrequency[dateIndex]);
    }

    chartData.addRows(addList);

    return chartData;
}

function prepareAllPerDay(data: Map<string, SerializedEntry[]>): google.visualization.DataTable {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Date");
    chartData.addColumn("number", "Frequency");

    var addList = [];

    var dateCounter = 0;

    for (const [key, value] of data) {
        if (dateCounter < 7 && dateCounter < data.size) {
            addList.unshift([key, value[0].frequency]);
        } else {
            break;
        }
    }

    chartData.addRows(addList);

    return chartData;
}

function prepareAllTitles(data: SerializedEntry[]) {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Survey Title");
    chartData.addColumn("number", "Total Administrations");

    for (const element of data) {
        chartData.addRow([element.title, element.frequency]);
    }

    return chartData;
}