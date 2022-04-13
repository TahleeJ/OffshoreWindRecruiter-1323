import { query } from "firebase/firestore";
import { add, max } from "lodash";
import { getQueryData } from "./Query";
import { DataQuery, Subject, Chart, SerializedEntry, stringifyDate } from "./Utility";

/**
 * Function to begin the actual chart drawing process based on the desired representation parameters
 * 
 * @param selectedSurveys the desired surveys to see data for
 * @param chartType the desired (chart) representation of the data
 * @param queryType the type of query to focus the data
 * @param allNavigators whether the data should focus on all navigators
 * @param forDay whether the data should focus on a single, specified day
 * @param startDate the desired day to start to see data for
 * @param selectedNavigators the specific navigator(s) to see data for
 */
export async function drawChart(subject: Subject, selectedSurveys: string[], selectedJobs: string[], chartType: Chart, queryType: DataQuery, allNavigators: boolean, forDay: boolean, startDate: string, selectedNavigators?: string[]) {
    switch (subject) {
        case Subject.Surveys:
            switch (queryType) {
                case DataQuery.AllTitlesPerDay:
                    drawTitlesPerDay(subject, queryType, chartType, selectedSurveys, allNavigators, forDay, startDate);
                    break;
                case DataQuery.AllPerDay:
                    drawPerDay(subject, queryType, chartType, allNavigators, forDay, startDate);
                    break;
                case DataQuery.AllTitles:
                    drawTitles(subject, queryType, chartType, allNavigators, forDay, startDate);   
                    break;
                case DataQuery.EachTitlesPerDay:
                    break;
                case DataQuery.EachPerDay:
                    break;
                case DataQuery.EachTitles:
                    break;
                case DataQuery.OneTitlesPerDay:
                    drawTitlesPerDay(subject, queryType, chartType, selectedSurveys, allNavigators, forDay, startDate, selectedNavigators);
                    break;
                case DataQuery.OnePerDay:
                    drawPerDay(subject, queryType, chartType, allNavigators, forDay, startDate, selectedNavigators);
                    break;
                case DataQuery.OneTitles:
                    drawTitles(subject, queryType, chartType, allNavigators, forDay, startDate, selectedNavigators); 
                    break;
            }
            break;
        case Subject.Jobs:
            if ([DataQuery.TotalJobMatches, DataQuery.PositiveJobMatches, DataQuery.NegativeJobMatches, DataQuery.SurveyPositiveJobMatches, DataQuery.SurveyNegativeJobMatches].includes(queryType)) {
                drawTotalMatches(subject, queryType, chartType, forDay, startDate, selectedJobs, selectedSurveys);
            } else if ([DataQuery.AverageJobMatches, DataQuery.AverageSurveyMatches].includes(queryType)) {
                drawSingleAverageScores(subject, queryType, chartType, forDay, startDate, selectedJobs, selectedSurveys);
            } else if ([DataQuery.HighestAverageJobMatches, DataQuery.LowestAverageJobMatches].includes(queryType)) {
                drawTieredAverages(subject, queryType, chartType, forDay, startDate);
            }
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
 * @param startDate the desired day to start to see data for
 * @param selectedNavigators the desired set of navigator(s) to see data for
 */
async function drawTitlesPerDay(subject: Subject, queryType: DataQuery, chartType: Chart, selectedSurveys: string[], allNavigators: boolean, forDay: boolean, startDate: string, selectedNavigators?: string[]) {
    var data: any
    
    // Retrieve data from BigQuery
    if (!allNavigators) {
        data = await getQueryData(subject, queryType, forDay, startDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(subject, queryType, forDay, startDate);
    }

    const title = `Total for Selected Surveys Administered ${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

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
    } else if (chartType === Chart.Table) {
        chartData = prepareTitlesPerDay(selectedSurveys, (!allNavigators ? data.get(selectedNavigators![0]) : data), true, false);

        new google.visualization.Table(document.getElementById('chart')!)
            .draw(chartData!)
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
            if (dateCounter < data.size) {
                const date = stringifyDate(key);
                surveyFrequency[dateCounter] = [date];
    
                // survey name -> {frequency}
                var surveyMap = new Map<string, number>();
    
                for (const survey of value) {
                    surveyMap.set(survey.surveyTitle!, survey.surveyFrequency!);
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
            if (dateCounter < data.size) {
                for (const survey of value) {
                    var surveyTotal = eachSurveyTotal.get(survey.surveyTitle!)!;

                    surveyTotal += survey.surveyFrequency!;

                    eachSurveyTotal.set(survey.surveyTitle!, surveyTotal);
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
async function drawPerDay(subject: Subject, queryType: DataQuery, chartType: Chart, allNavigators: boolean, forDay: boolean, startDate: string, selectedNavigators?: string[]) {
    var data: any

    if (!allNavigators) {
        data = await getQueryData(subject, queryType, forDay, startDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(subject, queryType, forDay, startDate);
    }

    const title = `Total for All Surveys Administered ${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

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
                colors: ['#6ed3ff']
            });
    } else if (chartType === Chart.Table) {
        new google.visualization.Table(document.getElementById('chart')!)
            .draw(chartData!);
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
            addList.unshift([date, value[0].surveyFrequency]);
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
async function drawTitles(subject: Subject, queryType: DataQuery, chartType: Chart, allNavigators: boolean, forDay: boolean, startDate:string, selectedNavigators?: string[]) {
    var data: any
    
    if (!allNavigators) {
        data = await getQueryData(subject, queryType, forDay, startDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(subject, queryType, forDay, startDate);
    }

    const title = `Total Surveys Administered ${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const chartData = prepareTitles((!allNavigators ? data.get(selectedNavigators![0]) : data));

    if (chartType === Chart.Pie) {
        new google.visualization.PieChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                pieSliceText: "percentage"
            });
    } else if (chartType === Chart.Table) {
        new google.visualization.Table(document.getElementById('chart')!)
            .draw(chartData!);
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
        chartData.addRow([element.surveyTitle, element.surveyFrequency]);
    }

    return chartData;
}

async function drawTotalMatches(subject: Subject, queryType: DataQuery, chartType: Chart, forDay: boolean, startDate: string, selectedJobs?: string[], selectedSurveys?: string[]) {
    const forJobs = !([DataQuery.SurveyPositiveJobMatches, DataQuery.SurveyNegativeJobMatches].includes(queryType));

    const title = `Total Job Matches ${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const data: any = await getQueryData(subject, queryType, forDay, startDate, undefined, selectedJobs);
    console.log(data);

    var chartData: google.visualization.DataTable;

    switch (chartType) {
        case Chart.Pie:
            chartData = prepareTotalMatches(data, forJobs, true, selectedJobs, selectedSurveys);

            new google.visualization.PieChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    pieSliceText: "percentage"
                });
            break;
        case Chart.Line:
            chartData = prepareTotalMatches(data, forJobs, false, selectedJobs, selectedSurveys);

            new google.visualization.LineChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    vAxis: {title: 'Jobs Matched'},
                    hAxis: {title: 'Day'},
                });
            break;
        case Chart.Bar:
            chartData = prepareTotalMatches(data, forJobs, false, selectedJobs, selectedSurveys);

            new google.visualization.BarChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    vAxis: {title: 'Day'},
                    hAxis: {title: 'Jobs Matched'},
                    colors: ['#6ed3ff']
                });
            break;
        case Chart.Table:
            chartData = prepareTotalMatches(data, forJobs, false, selectedJobs, selectedSurveys);

            new google.visualization.Table(document.getElementById('chart')!)
                .draw(chartData!);
            break;
    }    
}

function prepareTotalMatches(data: Map<string, SerializedEntry[]>, forJobs: boolean, total: boolean, selectedJobs?: string[], selectedSurveys?: string[]): google.visualization.DataTable {
    var chartData = new google.visualization.DataTable();

    if (forJobs) {
        if (total) {
            var eachJobTotal: Map<string, number> = new Map<string, number>();

            selectedJobs!.forEach((jobName) => {
                eachJobTotal.set(jobName, 0);
            });        

            chartData.addColumn("string", "Job Matched");
            chartData.addColumn("number", "Total Matches");

            for (const [key, value] of data) {
                for (const job of value) {
                    var matchTotal = eachJobTotal.get(job.jobName!)!;

                    matchTotal += job.matchFrequency!;

                    eachJobTotal.set(job.jobName!, matchTotal);
                }
            }

            for (const [key, value] of eachJobTotal) {
                chartData.addRow([key, value]);
            }
        } else {
            var eachJobList: Map<string, number>[] = [];
            var matchFrequency: [any[]] = [[]];
            var addList = [];

            chartData.addColumn("string", "Date");

            selectedJobs!.forEach((jobName) => {
                chartData.addColumn("number", jobName);
            });
    
            var dateCounter = 0;

            for (const [key, value] of data) {
                if (dateCounter < data.size) {
                    const date = stringifyDate(key);
                    matchFrequency[dateCounter] = [date];
        
                    // job name -> {count}
                    var jobMap = new Map<string, number>();
        
                    for (const job of value) {
                        jobMap.set(job.jobName!, job.matchFrequency!);
                    }
        
                    eachJobList[dateCounter] = jobMap;
        
                    dateCounter++;
                } else {
                    break;
                }
            }

            selectedJobs!.forEach((jobName) => {
                var index = 0;

                for (const dateElement of eachJobList) {
                    matchFrequency[index].push(dateElement.get(jobName!));
                    index++;
                }
            })

            for (const element of matchFrequency) {
                addList.unshift(element);
            }

            chartData.addRows(addList);
        }
    } else {
        if (total) {
            var eachSurveyTotal: Map<string, number> = new Map<string, number>();

            selectedSurveys!.forEach((surveyName) => {
                eachSurveyTotal.set(surveyName, 0);
            });        

            chartData.addColumn("string", "Survey Administered");
            chartData.addColumn("number", "Total Matches");

            for (const [key, value] of data) {
                for (const survey of value) {
                    var matchTotal = eachSurveyTotal.get(survey.surveyTitle!)!;

                    matchTotal += survey.matchFrequency!;

                    eachSurveyTotal.set(survey.surveyTitle!, matchTotal);
                }
            }

            for (const [key, value] of eachSurveyTotal) {
                chartData.addRow([key, value]);
            }
        } else {
            var eachSurveyList: Map<string, number>[] = [];
            var matchFrequency: [any[]] = [[]];
            var addList = [];

            chartData.addColumn("string", "Date");

            selectedSurveys!.forEach((surveyName) => {
                chartData.addColumn("number", surveyName);
            });
    
            var dateCounter = 0;

            for (const [key, value] of data) {
                if (dateCounter < data.size) {
                    const date = stringifyDate(key);
                    matchFrequency[dateCounter] = [date];
        
                    // survey name -> {count}
                    var surveyMap = new Map<string, number>();
        
                    for (const survey of value) {
                        surveyMap.set(survey.surveyTitle!, survey.matchFrequency!);
                    }
        
                    eachSurveyList[dateCounter] = surveyMap;
        
                    dateCounter++;
                } else {
                    break;
                }
            }

            selectedSurveys!.forEach((surveyName) => {
                var index = 0;

                for (const dateElement of eachSurveyList) {
                    matchFrequency[index].push(dateElement.get(surveyName!));
                    index++;
                }
            })

            for (const element of matchFrequency) {
                addList.unshift(element);
            }

            chartData.addRows(addList);
        }
    }

    return chartData;
}

async function drawSingleAverageScores(subject: Subject, queryType: DataQuery, chartType: Chart, forDay: boolean, startDate: string, selectedJobs?: string[], selectedSurveys?: string[]) {
    const forJobs = queryType == DataQuery.AverageJobMatches;

    const title = `Average Job Matches ${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const data: any = await getQueryData(subject, queryType, forDay, startDate, undefined, selectedJobs);
    console.log(data);

    var chartData: google.visualization.DataTable;

    switch (chartType) {
        case Chart.Line:
            chartData = prepareSingleAverageScores(data, forJobs, selectedJobs, selectedSurveys);

            new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Average Score'},
                hAxis: {title: 'Day'},
              });
            break;
        case Chart.Bar:
            chartData = prepareSingleAverageScores(data, forJobs, selectedJobs, selectedSurveys);

            new google.visualization.BarChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    vAxis: {title: 'Day'},
                    hAxis: {title: 'Average Score'},
                    colors: ['#6ed3ff']
                });
            break;
        case Chart.Table:
            chartData = prepareSingleAverageScores(data, forJobs, selectedJobs, selectedSurveys);

            new google.visualization.Table(document.getElementById('chart')!)
                .draw(chartData!);
            break;
    }    
}

function prepareSingleAverageScores(data: Map<string, SerializedEntry[]>, forJobs: boolean, selectedJobs?: string[], selectedSurveys?: string[]) {
    var chartData = new google.visualization.DataTable();

    chartData.addColumn("string", "Date");

    if (forJobs) {
        var eachJobList: Map<string, number>[] = [];
        var matchFrequency: [any[]] = [[]];
        var addList = [];

        selectedJobs!.forEach((jobName) => {
            chartData.addColumn("number", jobName);
        });

        var dateCounter = 0;

        for (const [key, value] of data) {
            if (dateCounter < data.size) {
                const date = stringifyDate(key);
                matchFrequency[dateCounter] = [date];
    
                // job name -> {count}
                var jobMap = new Map<string, number>();
    
                for (const job of value) {
                    jobMap.set(job.jobName!, job.score!);
                }
    
                eachJobList[dateCounter] = jobMap;
    
                dateCounter++;
            } else {
                break;
            }
        }

        selectedJobs!.forEach((jobName) => {
            var index = 0;

            for (const dateElement of eachJobList) {
                matchFrequency[index].push(dateElement.get(jobName!));
                index++;
            }
        })

        for (const element of matchFrequency) {
            addList.unshift(element);
        }

        chartData.addRows(addList);
    } else {
        var eachSurveyList: Map<string, number>[] = [];
        var matchFrequency: [any[]] = [[]];
        var addList = [];

        selectedSurveys!.forEach((surveyName) => {
            chartData.addColumn("number", surveyName);
        });

        var dateCounter = 0;

        for (const [key, value] of data) {
            if (dateCounter < data.size) {
                const date = stringifyDate(key);
                matchFrequency[dateCounter] = [date];
    
                // survey name -> {count}
                var surveyMap = new Map<string, number>();
    
                for (const survey of value) {
                    surveyMap.set(survey.surveyTitle!, survey.score!);
                }
    
                eachSurveyList[dateCounter] = surveyMap;
    
                dateCounter++;
            } else {
                break;
            }
        }

        selectedSurveys!.forEach((surveyName) => {
            var index = 0;

            for (const dateElement of eachSurveyList) {
                matchFrequency[index].push(dateElement.get(surveyName!));
                index++;
            }
        })

        for (const element of matchFrequency) {
            addList.unshift(element);
        }

        chartData.addRows(addList);
    }

    return chartData;
}

async function drawTieredAverages(subject: Subject, queryType: DataQuery, chartType: Chart, forDay: boolean, startDate: string) {
    const highest = queryType == DataQuery.HighestAverageJobMatches;
    const title = `${(highest ? "Highest Scoring Jobs " : "Lowest Scoring Jobs ")} ${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const data: any = await getQueryData(subject, queryType, forDay, startDate);
    console.log(data);

    var chartData: google.visualization.DataTable;

    switch (chartType) {
        case Chart.Bar:
            chartData = prepareTieredAverages(data, false, highest);

            new google.visualization.BarChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    vAxis: {title: 'Day'},
                    hAxis: {title: 'Average Score'},
                    colors: ['#6ed3ff']
                });
            break;
        case Chart.Table:
            chartData = prepareTieredAverages(data, false, highest);

            new google.visualization.Table(document.getElementById('chart')!)
                .draw(chartData!);
            break;
        case Chart.TreeMap:
            chartData = prepareTieredAverages(data, true, highest);

            var minColor;
            var midColor;
            var maxColor;

            if (queryType == DataQuery.HighestAverageJobMatches) {
                minColor = '#38ff53';
                midColor = '#36f9ff';
                maxColor = '#3d4dff';
            } else {
                minColor = '#ff2e2e';
                midColor = '#ff9b30';
                maxColor = '#fff933';
            }

            new google.visualization.TreeMap(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    minColor: minColor,
                    midColor: midColor,
                    maxColor: maxColor,
                    fontColor: 'black',
                    showScale: true
                });
    }   
}

function prepareTieredAverages(data: SerializedEntry[], tree: boolean, highest: boolean) {
    var chartData = new google.visualization.DataTable();

    if (tree) {
        chartData.addColumn("string", "Job Name");
        chartData.addColumn("string", "Parent");
        chartData.addColumn("number", "Average Score");
        chartData.addColumn("number", "Ranking");

        chartData.addRow(["All Jobs", null, 0, 0]);

        var index = 0;

        for (const value of data) {
            const score = (value.score! < 0) ? (-1 * value.score!) : value.score!;
            const colorScale = (value.score! < 0) ? (score * 50) : (score * 50 + 50);

            chartData.addRow([value.jobName!, "All Jobs", score, colorScale]);
            index++;
        }
    } else {
        chartData.addColumn("string", "Job Name");
        chartData.addColumn("number", "Average Score");

        for (const value of data) {
            chartData.addRow([value.jobName!, value.score!]);
        }
    }

    return chartData;
}