import { getQueryData } from "./Query";
import { SelectionArrays, DateSelection, DataQuery, Subject, Chart, SerializedEntry, stringifyDate } from "./Utility";

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
export async function drawChart(
    subject: Subject, 
    chartType: Chart, 
    queryType: DataQuery, 
    allNavigators: boolean, 
    dateSelection: DateSelection, 
    selectionArrays: SelectionArrays) {

    switch (subject) {
        case Subject.Surveys:
            if ([
                DataQuery.AllTitlesPerDay, 
                DataQuery.OneTitlesPerDay
                ].includes(queryType)) {
                drawSurveyTitlesPerDay(subject, queryType, chartType, allNavigators, dateSelection, selectionArrays);
            } else if ([
                DataQuery.AllPerDay, 
                DataQuery.OnePerDay
                ].includes(queryType)) {
                drawSurveysPerDay(subject, queryType, chartType, allNavigators, dateSelection, selectionArrays);
            } else if ([
                DataQuery.AllTitles,
                DataQuery.OneTitles
                ].includes(queryType)) {
                drawSurveyTitles(subject, queryType, chartType, allNavigators, dateSelection, selectionArrays); 
            }

            break;
        case Subject.Jobs:
            if ([
                DataQuery.TotalJobMatches, 
                DataQuery.PositiveJobMatches, 
                DataQuery.NegativeJobMatches, 
                DataQuery.SurveyPositiveJobMatches, 
                DataQuery.SurveyNegativeJobMatches
                ].includes(queryType)) {
                drawTotalJobMatches(subject, queryType, chartType, dateSelection, selectionArrays);
            } else if ([
                DataQuery.AverageJobMatches, 
                DataQuery.AverageSurveyMatches
                ].includes(queryType)) {
                drawAverageJobScores(subject, queryType, chartType, dateSelection, selectionArrays);
            } else if ([
                DataQuery.HighestAverageJobMatches, 
                DataQuery.LowestAverageJobMatches
                ].includes(queryType)) {
                drawTieredAverageJobScores(subject, queryType, chartType, dateSelection);
            }

            break;
        case Subject.Labels:
            if ([
                DataQuery.LabelPoints
                ].includes(queryType)) {
                drawAllLabelScores(subject, queryType, chartType, dateSelection, selectionArrays);
            } else if ([
                DataQuery.LabelAverage
                ].includes(queryType)) {
                drawAverageLabelScores(subject, queryType, chartType, dateSelection, selectionArrays);
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
async function drawSurveyTitlesPerDay(
    subject: Subject, 
    queryType: DataQuery, 
    chartType: Chart, 
    allNavigators: boolean, 
    dateSelection: DateSelection, 
    selectionArrays: SelectionArrays) {

    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;
    const selectedNavigators = selectionArrays.navigators;
    const selectedSurveys = selectionArrays.surveys;
    
    var data: any
    
    // Retrieve data from BigQuery
    if (!allNavigators) {
        data = await getQueryData(subject, queryType, forDay, startDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(subject, queryType, forDay, startDate);
    }

    const title = `Total for Selected Surveys Administered ` + 
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    // Chart drawing using transformed BigQuery data
    var chartData: google.visualization.DataTable;

    if (chartType === Chart.Combo) {
        chartData = prepareSurveyTitlesPerDay(
            selectedSurveys!, 
            (!allNavigators ? data.get(selectedNavigators![0]) : data), 
            true, 
            false);

        var seriesOptions = [];
        var tempCounter = 0;
    
        while (tempCounter < selectedSurveys!.length) {
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
        chartData = prepareSurveyTitlesPerDay(
            selectedSurveys!, 
            (!allNavigators ? data.get(selectedNavigators![0]) : data), 
            false, 
            false);

        new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Surveys Administered'},
                hAxis: {title: 'Day'}
            });
    } else if (chartType === Chart.Bar) {
        chartData = prepareSurveyTitlesPerDay(
            selectedSurveys!, 
            (!allNavigators ? data.get(selectedNavigators![0]) : data), 
            false, 
            false);

        new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Day'},
                hAxis: {title: 'Surveys Administered'},
                isStacked: true
            });
    } else if (chartType === Chart.Pie) {
        chartData = prepareSurveyTitlesPerDay(
            selectedSurveys!, 
            (!allNavigators ? data.get(selectedNavigators![0]) : data), 
            false, 
            true);

        new google.visualization.PieChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                pieSliceText: "percentage"
            });
    } else if (chartType === Chart.Table) {
        chartData = prepareSurveyTitlesPerDay(
            selectedSurveys!, 
            (!allNavigators ? data.get(selectedNavigators![0]) : data), 
            true, 
            false);

            new google.visualization.Table(document.getElementById('chart')!)
                .draw(chartData!, {
                    height: 300
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
function prepareSurveyTitlesPerDay(
    selectedSurveys: string[], 
    data: Map<string, SerializedEntry[]>, 
    includeAverage: boolean, total: boolean
    ) {

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
async function drawSurveysPerDay(
    subject: Subject, 
    queryType: DataQuery, 
    chartType: Chart, 
    allNavigators: boolean, 
    dateSelection: DateSelection, 
    selectionArrays: SelectionArrays) {

    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;
    const selectedNavigators = selectionArrays.navigators;  

    var data: any

    if (!allNavigators) {
        data = await getQueryData(subject, queryType, forDay, startDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(subject, queryType, forDay, startDate);
    }

    const title = `Total for All Surveys Administered ` +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const chartData = prepareSurveysPerDay((!allNavigators ? data.get(selectedNavigators![0]) : data));

    switch (chartType) {
        case Chart.Line:
            new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Surveys Administered'},
                hAxis: {title: 'Day'},
              });
            break;
        case Chart.Bar:
            new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Day'},
                hAxis: {title: 'Surveys Administered'},
                colors: ['#6ed3ff']
            });
            break;
        case Chart.Table:
            new google.visualization.Table(document.getElementById('chart')!)
            .draw(chartData!, {
                height: 300
            });
            break;
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
function prepareSurveysPerDay(data: Map<string, SerializedEntry[]>) {
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
async function drawSurveyTitles(
    subject: Subject, 
    queryType: DataQuery, 
    chartType: Chart, 
    allNavigators: boolean, 
    dateSelection: DateSelection, 
    selectionArrays: SelectionArrays) {

    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;
    const selectedNavigators = selectionArrays.navigators;
    
    var data: any
    
    if (!allNavigators) {
        data = await getQueryData(subject, queryType, forDay, startDate, selectedNavigators![0]);
    } else {
        data = await getQueryData(subject, queryType, forDay, startDate);
    }

    const title = `Total Surveys Administered ` +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const chartData = prepareSurveyTitles((!allNavigators ? data.get(selectedNavigators![0]) : data));

    switch (chartType) {
        case Chart.Pie:
            new google.visualization.PieChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                pieSliceText: "percentage"
            });
            break;
        case Chart.Table:
            new google.visualization.Table(document.getElementById('chart')!)
            .draw(chartData!, {
                height: 300
            });
            break;
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
function prepareSurveyTitles(data: SerializedEntry[]) {
    var chartData = new google.visualization.DataTable();
    chartData.addColumn("string", "Survey Title");
    chartData.addColumn("number", "Total Administrations");

    for (const element of data) {
        chartData.addRow([element.surveyTitle, element.surveyFrequency]);
    }

    return chartData;
}

async function drawTotalJobMatches(
    subject: Subject, 
    queryType: DataQuery, 
    chartType: Chart, 
    dateSelection: DateSelection, 
    selectionArrays: SelectionArrays) {

    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;
    const selectedJobs = selectionArrays.jobs;

    const forJobs = !([DataQuery.SurveyPositiveJobMatches, DataQuery.SurveyNegativeJobMatches].includes(queryType));

    const title = `Total Job Matches ` +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const data: any = await getQueryData(subject, queryType, forDay, startDate, undefined, selectedJobs);
    console.log(data);

    var chartData: google.visualization.DataTable;

    switch (chartType) {
        case Chart.Pie:
            chartData = prepareTotalJobMatches(data, forJobs, true, selectionArrays);

            new google.visualization.PieChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    pieSliceText: "percentage"
                });
            break;
        case Chart.Line:
            chartData = prepareTotalJobMatches(data, forJobs, false, selectionArrays);

            new google.visualization.LineChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    vAxis: {title: 'Jobs Matched'},
                    hAxis: {title: 'Day'},
                });
            break;
        case Chart.Bar:
            chartData = prepareTotalJobMatches(data, forJobs, false, selectionArrays);

            new google.visualization.BarChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    vAxis: {title: 'Day'},
                    hAxis: {title: 'Jobs Matched'},
                    colors: ['#6ed3ff']
                });
            break;
        case Chart.Table:
            chartData = prepareTotalJobMatches(data, forJobs, false, selectionArrays);

            new google.visualization.Table(document.getElementById('chart')!)
                .draw(chartData!, {
                    height: 300
                });
            break;
    }    
}

function prepareTotalJobMatches(
    data: Map<string, SerializedEntry[]>, 
    forJobs: boolean, 
    total: boolean, 
    selectionArrays: SelectionArrays) {

    const selectedSurveys = selectionArrays.surveys;
    const selectedJobs = selectionArrays.jobs;   
   
    var chartData = new google.visualization.DataTable();

    var dateCounter = 0;
    var matchTotal = 0;
    var matchFrequency: [any[]] = [[]];
    var addList = [];

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
                    matchTotal = eachJobTotal.get(job.jobName!)!;

                    matchTotal += job.matchFrequency!;

                    eachJobTotal.set(job.jobName!, matchTotal);
                }
            }

            for (const [key, value] of eachJobTotal) {
                chartData.addRow([key, value]);
            }
        } else {
            var eachJobList: Map<string, number>[] = [];

            chartData.addColumn("string", "Date");

            selectedJobs!.forEach((jobName) => {
                chartData.addColumn("number", jobName);
            });

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
                    matchTotal = eachSurveyTotal.get(survey.surveyTitle!)!;

                    matchTotal += survey.matchFrequency!;

                    eachSurveyTotal.set(survey.surveyTitle!, matchTotal);
                }
            }

            for (const [key, value] of eachSurveyTotal) {
                chartData.addRow([key, value]);
            }
        } else {
            var eachSurveyList: Map<string, number>[] = [];

            chartData.addColumn("string", "Date");

            selectedSurveys!.forEach((surveyName) => {
                chartData.addColumn("number", surveyName);
            });

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

async function drawAverageJobScores(
    subject: Subject, 
    queryType: DataQuery, 
    chartType: Chart, 
    dateSelection: DateSelection, 
    selectionArrays: SelectionArrays) {

    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;
    const selectedJobs = selectionArrays.jobs;
    
    const forJobs = queryType === DataQuery.AverageJobMatches;

    const title = `Average Job Matches ` +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const data: any = await getQueryData(subject, queryType, forDay, startDate, undefined, selectedJobs);
    console.log(data);

    var chartData: google.visualization.DataTable;

    switch (chartType) {
        case Chart.Line:
            chartData = prepareAverageJobScores(data, forJobs, selectionArrays);

            new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Average Score'},
                hAxis: {title: 'Day'},
              });
            break;
        case Chart.Bar:
            chartData = prepareAverageJobScores(data, forJobs, selectionArrays);

            new google.visualization.BarChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    vAxis: {title: 'Day'},
                    hAxis: {title: 'Average Score'},
                    colors: ['#6ed3ff']
                });
            break;
        case Chart.Table:
            chartData = prepareAverageJobScores(data, forJobs, selectionArrays);

            new google.visualization.Table(document.getElementById('chart')!)
                .draw(chartData!, {
                    height: 300
                });
            break;
    }    
}

function prepareAverageJobScores(
    data: Map<string, SerializedEntry[]>, 
    forJobs: boolean, 
    selectionArrays: SelectionArrays) {

    const selectedSurveys = selectionArrays.surveys;
    const selectedJobs = selectionArrays.jobs;

    var chartData = new google.visualization.DataTable();

    chartData.addColumn("string", "Date");

    var dateCounter = 0;
    var matchFrequency: [any[]] = [[]];
    var addList = [];

    if (forJobs) {
        var eachJobList: Map<string, number>[] = [];

        selectedJobs!.forEach((jobName) => {
            chartData.addColumn("number", jobName);
        });

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

        selectedSurveys!.forEach((surveyName) => {
            chartData.addColumn("number", surveyName);
        });

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

async function drawTieredAverageJobScores(
    subject: Subject, 
    queryType: DataQuery, 
    chartType: Chart, 
    dateSelection: DateSelection) {

    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;

    const highest = queryType === DataQuery.HighestAverageJobMatches;
    const title = `${(highest ? "Highest Scoring Jobs " : "Lowest Scoring Jobs ")} ` +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const data: any = await getQueryData(subject, queryType, forDay, startDate);
    console.log(data);

    var chartData: google.visualization.DataTable;

    switch (chartType) {
        case Chart.Bar:
            chartData = prepareTieredAverageJobScores(data, false);

            new google.visualization.BarChart(document.getElementById('chart')!)
                .draw(chartData!, {
                    title: title,
                    vAxis: {title: 'Day'},
                    hAxis: {title: 'Average Score'},
                    colors: ['#6ed3ff']
                });
            break;
        case Chart.Table:
            chartData = prepareTieredAverageJobScores(data, false);

            new google.visualization.Table(document.getElementById('chart')!)
                .draw(chartData!, {
                    height: 300
                });
            break;
        case Chart.TreeMap:
            chartData = prepareTieredAverageJobScores(data, true);

            var minColor;
            var midColor;
            var maxColor;

            if (highest) {
                minColor = '#00ff22';
                midColor = '#00f7ff';
                maxColor = '#1e00ff';
            } else {
                minColor = '#ff0000';
                midColor = '#ff8400';
                maxColor = '#fff700';
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

function prepareTieredAverageJobScores(data: SerializedEntry[], tree: boolean) {
    var chartData = new google.visualization.DataTable();

    if (tree) {
        chartData.addColumn("string", "Job Name");
        chartData.addColumn("string", "Parent");
        chartData.addColumn("number", "Average Score");
        chartData.addColumn("number", "Ranking");

        chartData.addRow(["All Jobs", null, 0, 0]);

        for (const value of data) {
            const score = (value.score! < 0) ? (-1 * value.score!) : value.score!;
            const colorScale = (value.score! < 0) ? (score * 50) : (score * 50 + 50);

            chartData.addRow([value.jobName!, "All Jobs", score, colorScale]);
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

async function drawAllLabelScores(
    subject: Subject, 
    queryType: DataQuery, 
    chartType: Chart, 
    dateSelection: DateSelection,
    selectionArrays: SelectionArrays) {

    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;

    const data: any = await getQueryData(subject, queryType, forDay, startDate, undefined, undefined, selectionArrays.labels);

    const preparedData = prepareAllLabelScores(data);
    var chartData: google.visualization.DataTable = preparedData.chartData;
    var frequency = preparedData.frequency;

    const title = `All Linear and Percentile Scores for ${frequency} Occurrences ` +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    switch (chartType) {
        case Chart.Table:
            new google.visualization.Table(document.getElementById('chart')!)
                .draw(chartData!, {
                    height: 300
                });
            break;
        case Chart.Scatter:
            new google.visualization.ScatterChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Linear Score', minValue: 0, maxValue: 1},
                hAxis: {title: 'Percentile Score', minValue: -1, maxValue: 1},
                legend: "none"
            });
            break;
    }
}

function prepareAllLabelScores(data: SerializedEntry[]) {
    var chartData = new google.visualization.DataTable();

    chartData.addColumn("number", "Linear Score");
    chartData.addColumn("number", "Percentile Score");

    for (const value of data) {
        chartData.addRow([value.linearScore!, value.percentileScore!]);
    }

    console.log(chartData);

    return {
        chartData: chartData,
        frequency: data[0].labelFrequency!
    };
}

async function drawAverageLabelScores(
    subject: Subject, 
    queryType: DataQuery, 
    chartType: Chart, 
    dateSelection: DateSelection, 
    selectionArrays: SelectionArrays) {

    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;

    const data: any = await getQueryData(subject, queryType, forDay, startDate, undefined, undefined, selectionArrays.labels!);
    console.log(data);

    var chartData: google.visualization.DataTable = prepareAverageLabelScores(data, selectionArrays.labels!);

    const title = `Average Linear and Percentile Scores ` +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;
    
    // 2 of each (darker, lighter) -> blue, green, yellow, orange, red
    const colorArray = ['#3683ff', '#5193fc', '#00a619', '#36ff54', '#bd8a00', '#ffd829', '#ff8b17', '#ff9e3d', '#ff2e2e', '#ff4242'];

    switch (chartType) {
        case Chart.Line:
            new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Average Score'},
                hAxis: {title: 'Day'},
                colors: colorArray,
                series: {
                    1: {
                        lineDashStyle: [7, 5]
                    },
                    3: {
                        lineDashStyle: [7, 5]
                    },
                    5: {
                        lineDashStyle: [7, 5]
                    },
                    7: {
                        lineDashStyle: [7, 5]
                    },
                    9: {
                        lineDashStyle: [7, 5]
                    }
                }
              });
            break;
        case Chart.Bar:
            new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: {title: 'Day'},
                hAxis: {title: 'Average Score'},
                colors: colorArray
              });
            break;
        case Chart.Table:
            new google.visualization.Table(document.getElementById('chart')!)
                .draw(chartData!, {
                    height: 300
                });
            break;
    }
}

function prepareAverageLabelScores(data: Map<string, SerializedEntry[]>, selectedLabels: string[]) {
    var chartData = new google.visualization.DataTable();
    console.log(data);

    chartData.addColumn("string", "Date");

    selectedLabels.forEach((labelName) => {
        chartData.addColumn("number", `${labelName} Linear`);
        chartData.addColumn("number", `${labelName} Percentile`);
    })

    var dateCounter = 0;
    var eachScoreList: Map<string, [number, number]>[] = [];
    var scoreFrequency: [any[]] = [[]];
    var addList = [];

    for (const [key, value] of data) {
        if (dateCounter < data.size) {
            const date = stringifyDate(key);
            scoreFrequency[dateCounter] = [date];

            // survey name -> {count}
            var scoreMap = new Map<string, [number, number]>();

            for (const score of value) {
                scoreMap.set(score.labelName!, [score.linearScore!, score.percentileScore!]);
            }

            eachScoreList[dateCounter] = scoreMap;

            dateCounter++;
        } else {
            break;
        }
    }

    selectedLabels!.forEach((labelName) => {
        var index = 0;

        for (const dateElement of eachScoreList) {
            scoreFrequency[index].push(dateElement.get(labelName!)![0]);
            scoreFrequency[index].push(dateElement.get(labelName!)![1]);
            index++;
        }
    })

    for (const element of scoreFrequency) {
        addList.unshift(element);
    }

    chartData.addRows(addList);

    return chartData;
}