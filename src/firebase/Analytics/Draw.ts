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
        default:
            prepareCombo(selectedSurveys, data);

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

function prepareCombo(selectedSurveys: string[], data: Map<string, SerializedEntry[]>) {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Day");
    // chartData.addColumn("number", "Total Administrations");

    var dateCounter = 0;
    var surveyCounter = 0;
    var dateList: string[] = [];
    var surveyList: string[] = [];
    var surveyFrequency: [any[]] = [[]];
    var eachSurveyList: Map<string, number>[] = [];
    // const indices = [0, 1, 2, 3, 4, 5, 6];
    const indices: number[] = [];

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
            // console.log(surveyMap);
            // console.log(eachSurveyList[dateCounter]);

            dateCounter++;
        } else {
            break;
        }
    }

    console.log(dateCounter);

    // for (const data of eachSurveyList![0]) {
    //     console.log(data.get());
    // }

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
            console.log(examineList);

            var usedFrequency = 0;

            if (examineList.has(selectedSurvey)) {
                usedFrequency = examineList.get(selectedSurvey)!;
                surveyFrequency[dateIndex].push(usedFrequency);
            } else {
                surveyFrequency[dateIndex].push(usedFrequency);
            }

            sumFrequency += usedFrequency;
        }

        const average = sumFrequency / 5;
        surveyFrequency[dateIndex].push(average);

        chartData.addRow(surveyFrequency[dateIndex]);

        console.log(surveyFrequency[dateIndex]);
    }

    // var columns = dateCounter + 1;

    var options = {
        title: 'Administered Survey Frequency Over The Past Week',
        vAxis: {title: 'Surveys Administered'},
        hAxis: {title: 'Month'},
        seriesType: 'bars',
        series: {5: {type: 'line'}},
    };

    var chart = new google.visualization.ComboChart(document.getElementById('chart')!);
    chart.draw(chartData!, options!);
}