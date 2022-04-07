import { DataQuery, getQueryData, SerializedEntry } from "./Analytics";

export enum Chart {
    Pie = 0,
    Combo = 1,
    Line = 2,
    Bar = 3,
    Table = 4
}

export async function drawChart(selectedSurveys: string[], selectedNavigators: string[], chartType: Chart, queryType: DataQuery) {
    var data: any;
    
    var chartData: google.visualization.DataTable;

    switch(queryType) {
        case DataQuery.AllTitlesPerDay:
            data = await getQueryData(queryType);

            if (chartType == Chart.Combo) {
                chartData = prepareTitlesPerDay(selectedSurveys, data, true);

                var seriesOptions = [];
                var tempCounter = 0;
            
                while (tempCounter < selectedSurveys.length) {
                    seriesOptions.push({});
            
                    tempCounter++;
                }
            
                seriesOptions.push({type: 'line'});

                new google.visualization.ComboChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: 'Total for Selected Surveys Administered Over the Past 7 Days',
                        vAxis: {title: 'Surveys Administered'},
                        hAxis: {title: 'Day'},
                        seriesType: 'bars',
                        series: seriesOptions
                    });
            } else if (chartType == Chart.Line) {
                chartData = prepareTitlesPerDay(selectedSurveys, data, false);

                new google.visualization.LineChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: 'Total for Selected Surveys Administered Over the Past 7 Days',
                        vAxis: {title: 'Surveys Administered'},
                        hAxis: {title: 'Day'}
                    });
            } else if (chartType == Chart.Bar) {
                chartData = prepareTitlesPerDay(selectedSurveys, data, false);

                new google.visualization.BarChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: 'Total for Selected Surveys Administered Over the Past 7 Days',
                        vAxis: {title: 'Surveys Administered'},
                        hAxis: {title: 'Day'},
                        isStacked: true
                    });
            }

            break;
        case DataQuery.AllPerDay:
            data = await getQueryData(queryType);
            chartData = preparePerDay(data);

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
            data = await getQueryData(queryType);
            chartData = prepareTitles(data);

            if (chartType == Chart.Pie) {
                new google.visualization.PieChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: 'Total Surveys Administered',
                        pieSliceText: "percentage"
                    });
            } else {
                new google.visualization.BarChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: 'Total Surveys Administered',
                });
            }      

            break;
        case DataQuery.EachTitlesPerDay:
            break;
        case DataQuery.EachPerDay:
            break;
        case DataQuery.EachTitles:
            break;
        case DataQuery.OneTitlesPerDay:
            data = await getQueryData(queryType, selectedNavigators[0]);

            if (chartType == Chart.Combo) {
                chartData = prepareTitlesPerDay(selectedSurveys, data.get(selectedNavigators[0]), true);

                var seriesOptions = [];
                var tempCounter = 0;
            
                while (tempCounter < selectedSurveys.length) {
                    seriesOptions.push({});
            
                    tempCounter++;
                }
            
                seriesOptions.push({type: 'line'});

                new google.visualization.ComboChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: `Total for ${selectedNavigators[0]} for Selected Surveys Administered Over the Past 7 Days`,
                        vAxis: {title: 'Surveys Administered'},
                        hAxis: {title: 'Day'},
                        seriesType: 'bars',
                        series: seriesOptions
                    });
            } else if (chartType == Chart.Line) {
                chartData = prepareTitlesPerDay(selectedSurveys, data.get(selectedNavigators[0]), false);

                new google.visualization.LineChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: `Total for ${selectedNavigators[0]} for Selected Surveys Administered Over the Past 7 Days`,
                        vAxis: {title: 'Surveys Administered'},
                        hAxis: {title: 'Day'}
                    });
            } else if (chartType == Chart.Bar) {
                chartData = prepareTitlesPerDay(selectedSurveys, data.get(selectedNavigators[0]), false);

                new google.visualization.BarChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: `Total for ${selectedNavigators[0]} for Selected Surveys Administered Over the Past 7 Days`,
                        vAxis: {title: 'Surveys Administered'},
                        hAxis: {title: 'Day'},
                        isStacked: true
                    });
            }

            break;
        case DataQuery.OnePerDay:
            data = await getQueryData(queryType, selectedNavigators[0]);
            chartData = preparePerDay(data.get(selectedNavigators[0]));

            if (chartType == Chart.Line) {
                new google.visualization.LineChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: `Total for ${selectedNavigators[0]} for All Surveys Administered Over the Past 7 Days`,
                      });
            } else {
                new google.visualization.BarChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: `Total for ${selectedNavigators[0]} for All Surveys Administered Over the Past 7 Days`,
                    });
            }
            break;
        case DataQuery.OneTitles:
            data = await getQueryData(queryType, selectedNavigators[0]);
            chartData = prepareTitles(data.get(selectedNavigators[0]));

            if (chartType == Chart.Pie) {
                new google.visualization.PieChart(document.getElementById('chart')!)
                    .draw(chartData!, {
                        title: `Total Surveys Administered for ${selectedNavigators[0]}`,
                        pieSliceText: "percentage"
                    });
            } else {
                new google.visualization.BarChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: `Total Surveys Administered for ${selectedNavigators[0]}`,
                });
            }        

            break;
    }
}

function prepareTitlesPerDay(selectedSurveys: string[], data: Map<string, SerializedEntry[]>, includeAverage: boolean): google.visualization.DataTable {
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

    return chartData;
}

function preparePerDay(data: Map<string, SerializedEntry[]>): google.visualization.DataTable {
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

function prepareTitles(data: SerializedEntry[]) {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Survey Title");
    chartData.addColumn("number", "Total Administrations");

    for (const element of data) {
        chartData.addRow([element.title, element.frequency]);
    }

    return chartData;
}