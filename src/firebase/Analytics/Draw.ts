import { DataQuery, getQueryData, SerializedEntry } from "./Analytics";

export enum Chart {
    Pie = 0
}

export async function drawChart(type: Chart, queryType: DataQuery, navigatorEmail?: string) {
    const data = await getQueryData(queryType, navigatorEmail);

    switch(type) {
        case Chart.Pie:
            preparePie(data);

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