import { DataQuery, getQueryData, SerializedEntry } from "./Analytics";

export enum Chart {
    Pie = 0,
    Line = 1,
    Combo = 2
}

export async function drawChart(selectedSurveys: string[], type: Chart, queryType: DataQuery, navigatorEmail?: string) {
    const data = await getQueryData(queryType, navigatorEmail);

    switch(type) {
        case Chart.Pie:
            preparePie(data);

            break;
        case Chart.Line:
            prepareLine(data);
            
            break;
        case Chart.Combo:
            prepareCombo(selectedSurveys, data);

            break;
        default:
            break;
    }
}

function preparePie(data: SerializedEntry[]) {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Survey Title");
    chartData.addColumn("number", "Total Administrations");

    for (const element of data) {
        chartData.addRow([element.title, element.frequency]);
    }

    console.log(chartData);

    var options = {
        title: 'Total Surveys Administered',
        pieSliceText: "percentage"
    };

    var chart = new google.visualization.PieChart(document.getElementById('chart')!);
    chart.draw(chartData!, options!);
}

function prepareLine(data: Map<string, SerializedEntry[]>) {
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

    var options = {
        title: 'Total Surveys Administered Over the Past 7 Days',
        reversibleCategories: true
      };

    var chart = new google.visualization.LineChart(document.getElementById('chart')!);
    chart.draw(chartData!, options);
}

function prepareCombo(selectedSurveys: string[], data: Map<string, SerializedEntry[]>) {
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

    var seriesOptions = [];
    var tempCounter = 0;

    while (tempCounter < selectedSurveys.length) {
        seriesOptions.push({});

        tempCounter++;
    }

    seriesOptions.push({type: 'line'});

    var options = {
        title: 'Administered Survey Frequency Over The Past Week',
        vAxis: {title: 'Surveys Administered'},
        hAxis: {title: 'Month'},
        seriesType: 'bars',
        series: seriesOptions
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart')!);
    chart.draw(chartData!, options);
}