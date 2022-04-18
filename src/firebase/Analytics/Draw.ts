import { getQueryData } from './Query';
import { SelectionArrays, DateSelection, DataQuery, Subject, Chart, SerializedEntry, stringifyDate } from './Utility';

/**
 * Function to begin the actual chart drawing process based on the desired representation parameters
 *
 * @param subject the subject type the data will focus on
 * @param queryType the type of query to focus the data
 * @param chartType the desired (chart) representation of the data
 * @param allNavigators whether the data should focus on all navigators
 * @param dateSelection the dateinformation that will be used to start pulling data from
 * @param selectionArrays the selected list of survey/job/labels to focus the data on depending on the subject
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
        if ((queryType & DataQuery.SurveysTitlesPerDay) !== 0) {
            drawSurveyTitlesPerDay(subject, queryType, chartType, allNavigators, dateSelection, selectionArrays);
        } else if ((queryType & DataQuery.SurveysPerDay) !== 0) {
            drawSurveysPerDay(subject, queryType, chartType, allNavigators, dateSelection, selectionArrays);
        } else if ((queryType & DataQuery.SurveysTitles) !== 0) {
            drawSurveyTitles(subject, queryType, chartType, allNavigators, dateSelection, selectionArrays);
        }

        break;
    case Subject.Jobs:
        if ((queryType & DataQuery.JobsTotalMatches) !== 0) {
            drawTotalJobMatches(subject, queryType, chartType, dateSelection, selectionArrays);
        } else if ((queryType & DataQuery.JobsSingleAverageMatches) !== 0) {
            drawAverageJobScores(subject, queryType, chartType, dateSelection, selectionArrays);
        } else if ((queryType & DataQuery.JobsTieredAverageMatches) !== 0) {
            drawTieredAverageJobScores(subject, queryType, chartType, dateSelection);
        }

        break;
    case Subject.Labels:
        if (queryType === DataQuery.LabelPoints) {
            drawAllLabelScores(subject, queryType, chartType, dateSelection, selectionArrays);
        } else if (queryType === DataQuery.LabelAverage) {
            drawAverageLabelScores(subject, queryType, chartType, dateSelection, selectionArrays);
        }
        break;
    }
}

/**
 * Chart drawing function to handle viewing data for the administration total of a desired
 * set of surveys over since the specified date.
 *
 * @param subject the subject type the data will focus on
 * @param queryType the type of query to focus the data
 * @param chartType the desired (chart) representation of the data
 * @param allNavigators whether the data should focus on all navigators
 * @param dateSelection the date information that will be used to start pulling data from
 * @param selectionArrays the selected list of survey/job/labels to focus the data on
 *                        depending on the subject
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

    let data: any;

    // Retrieve data from BigQuery
    if (!allNavigators) {
        data = await getQueryData(subject, queryType, forDay, startDate, selectionArrays);
    } else {
        data = await getQueryData(subject, queryType, forDay, startDate);
    }

    const title = 'Total for Selected Surveys Administered ' +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    let chartData: google.visualization.DataTable;

    switch (chartType) {
    case Chart.Combo:
        chartData = prepareSurveyTitlesPerDay(
            selectedSurveys!,
            (!allNavigators ? data.get(selectedNavigators![0]) : data),
            true,
            false);

        const seriesOptions = [];
        let tempCounter = 0;

        while (tempCounter < selectedSurveys!.length) {
            seriesOptions.push({});
            tempCounter++;
        }

        seriesOptions.push({ type: 'line' });

        new google.visualization.ComboChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Surveys Administered' },
                hAxis: { title: 'Day' },
                seriesType: 'bars',
                series: seriesOptions
            });
        break;
    case Chart.Line:
        chartData = prepareSurveyTitlesPerDay(
            selectedSurveys!,
            (!allNavigators ? data.get(selectedNavigators![0]) : data),
            false,
            false);

        new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Surveys Administered' },
                hAxis: { title: 'Day' }
            });
        break;
    case Chart.Bar:
        chartData = prepareSurveyTitlesPerDay(
            selectedSurveys!,
            (!allNavigators ? data.get(selectedNavigators![0]) : data),
            false,
            false);

        new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Day' },
                hAxis: { title: 'Surveys Administered' },
                isStacked: true
            });
        break;
    case Chart.Table:
        chartData = prepareSurveyTitlesPerDay(
            selectedSurveys!,
            (!allNavigators ? data.get(selectedNavigators![0]) : data),
            true,
            false);

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
 * *Converts data particularly for the administration total of each selected survey
 * since the specified date
 *
 * @param selectedSurveys the desired surveys to see data for
 * @param data the transformed data received from BigQuery
 * @param includeAverage whether to calculate (and include) an average line in the data set
 * @param total whether to calculate the total appearance of the desired surveys since the
 *              specified date instead of per day
 * @returns the Google Chart-recognizable set of data
 */
function prepareSurveyTitlesPerDay(
    selectedSurveys: string[],
    data: Map<string, SerializedEntry[]>,
    includeAverage: boolean,
    total: boolean) {
    const chartData = new google.visualization.DataTable();

    let dateCounter = 0;

    if (!total) {
        const eachSurveyList: Map<string, number>[] = [];
        const surveyFrequency: [any[]] = [[]];
        const indices: number[] = [];
        const addList = [];

        chartData.addColumn('string', 'Date');

        selectedSurveys.forEach((surveyName) => {
            chartData.addColumn('number', surveyName);
        });

        for (const [key, value] of data) {
            if (dateCounter < data.size) {
                const date = stringifyDate(key);
                surveyFrequency[dateCounter] = [date];

                const surveyMap = new Map<string, number>();

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
        let temp = 0;

        while (temp < dateCounter) {
            indices.push(temp);

            temp++;
        }

        if (includeAverage) {
            chartData.addColumn('number', 'Average');
        }

        for (const dateIndex of indices) {
            let sumFrequency = 0;

            for (const selectedSurvey of selectedSurveys) {
                const examineList = eachSurveyList[dateIndex];
                let usedFrequency = 0;

                if (examineList.has(selectedSurvey)) {
                    usedFrequency = examineList.get(selectedSurvey)!;
                }
                    
                surveyFrequency[dateIndex].push(usedFrequency);
                sumFrequency += usedFrequency;
            }

            if (includeAverage) {
                const average = sumFrequency / selectedSurveys.length;
                surveyFrequency[dateIndex].push(average);
            }

            // Reorder the data to make the furthest date the top-most date
            addList.unshift(surveyFrequency[dateIndex]);
        }

        chartData.addRows(addList);
    } else {
        const eachSurveyTotal: Map<string, number> = new Map<string, number>();

        selectedSurveys.forEach((surveyName) => {
            eachSurveyTotal.set(surveyName, 0);
        });

        chartData.addColumn('string', 'Survey Administered');
        chartData.addColumn('number', 'Frequency');

        for (const [key, value] of data) {
            if (dateCounter < data.size) {
                for (const survey of value) {
                    let surveyTotal = eachSurveyTotal.get(survey.surveyTitle!)!;
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
 * Chart drawing function to handle viewing data for the administration total of all surveys
 * since the specified date
 *
 * @param subject the subject type the data will focus on
 * @param queryType the type of query to focus the data
 * @param chartType the desired (chart) representation of the data
 * @param allNavigators whether the data should focus on all navigators
 * @param dateSelection the date information that will be used to start pulling data from
 * @param selectionArrays the selected list of survey/job/labels to focus the data on
 *                        depending on the subject
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

    let data: any;

    // Retrieve data from BigQuery
    if (!allNavigators) {
        data = await getQueryData(subject, queryType, forDay, startDate, selectionArrays);
    } else {
        data = await getQueryData(subject, queryType, forDay, startDate);
    }

    const title = 'Total for All Surveys Administered ' +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const chartData = prepareSurveysPerDay((!allNavigators ? data.get(selectedNavigators![0]) : data));

    switch (chartType) {
    case Chart.Line:
        new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Surveys Administered' },
                hAxis: { title: 'Day' }
            });
        break;
    case Chart.Bar:
        new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Day' },
                hAxis: { title: 'Surveys Administered' },
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
 * *Converts data particularly for the administration total of all surveys since the specified date
 *
 * @param data the transformed data received from BigQuery
 * @returns the Google Chart-recognizable set of data
 */
function prepareSurveysPerDay(data: Map<string, SerializedEntry[]>) {
    const chartData = new google.visualization.DataTable();
    chartData.addColumn('string', 'Date');
    chartData.addColumn('number', 'Frequency');

    const addList = [];
    const dateCounter = 0;

    for (const [key, value] of data) {
        if (dateCounter < 7 && dateCounter < data.size) {
            const date = stringifyDate(key);

            // Reorder the data to make the furthest date the top-most date
            addList.unshift([date, value[0].surveyFrequency]);
        } else {
            break;
        }
    }

    chartData.addRows(addList);

    return chartData;
}

/**
 * Chart drawing function to handle viewing data for the administration total of each survey
 * since the specified date
 *
 * @param subject the subject type the data will focus on
 * @param queryType the type of query to focus the data
 * @param chartType the desired (chart) representation of the data
 * @param allNavigators whether the data should focus on all navigators
 * @param dateSelection the date information that will be used to start pulling data from
 * @param selectionArrays the selected list of survey/job/labels to focus the data on
 *                        depending on the subject
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

    let data: any;

    // Retrieve data from BigQuery
    if (!allNavigators) {
        data = await getQueryData(subject, queryType, forDay, startDate, selectionArrays);
    } else {
        data = await getQueryData(subject, queryType, forDay, startDate);
    }

    const title = 'Total Surveys Administered ' +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    const chartData = prepareSurveyTitles((!allNavigators ? data.get(selectedNavigators![0]) : data));

    switch (chartType) {
    case Chart.Pie:
        new google.visualization.PieChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                pieSliceText: 'percentage'
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
 * *Converts data particularly for the administration total of each survey since the specified date.
 *
 * @param data the transformed data received from BigQuery
 * @returns the Google Chart-recognizable set of data
 */
function prepareSurveyTitles(data: SerializedEntry[]) {
    const chartData = new google.visualization.DataTable();
    chartData.addColumn('string', 'Survey Title');
    chartData.addColumn('number', 'Total Administrations');

    for (const element of data) {
        chartData.addRow([element.surveyTitle, element.surveyFrequency]);
    }

    return chartData;
}

/**
 * Chart drawing function to handle viewing data for the total matches of each selected job
 * since the specified date
 *
 * @param subject the subject type the data will focus on
 * @param queryType the type of query to focus the data
 * @param chartType the desired (chart) representation of the data
 * @param dateSelection the date information that will be used to start pulling data from
 * @param selectionArrays the selected list of survey/job/labels to focus the data on
 *                        depending on the subject
 */
async function drawTotalJobMatches(
    subject: Subject,
    queryType: DataQuery,
    chartType: Chart,
    dateSelection: DateSelection,
    selectionArrays: SelectionArrays) {
    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;

    // Retrieve data from BigQuery
    const data: any = await getQueryData(subject, queryType, forDay, startDate, selectionArrays);

    const forJobs = (queryType & DataQuery.JobsSurveys) === 0;
    const title = 'Total Job Matches ' +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    let chartData: google.visualization.DataTable;

    switch (chartType) {
    case Chart.Pie:
        chartData = prepareTotalJobMatches(data, forJobs, true, selectionArrays);

        new google.visualization.PieChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                pieSliceText: 'percentage'
            });
        break;
    case Chart.Line:
        chartData = prepareTotalJobMatches(data, forJobs, false, selectionArrays);

        new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Jobs Matched' },
                hAxis: { title: 'Day' }
            });
        break;
    case Chart.Bar:
        chartData = prepareTotalJobMatches(data, forJobs, false, selectionArrays);

        new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Day' },
                hAxis: { title: 'Jobs Matched' },
                isStacked: true
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

/**
 * Converts the data received from BigQuery into a format recognized by Google Charts
 *
 * *Converts data particularly for the total matches of each selected job since the specified date
 *
 * @param data the transformed data received from BigQuery
 * @returns the Google Chart-recognizable set of data
 */
function prepareTotalJobMatches(
    data: Map<string, SerializedEntry[]>,
    forJobs: boolean,
    total: boolean,
    selectionArrays: SelectionArrays) {
    const selectedSurveys = selectionArrays.surveys;
    const selectedJobs = selectionArrays.jobs;

    const chartData = new google.visualization.DataTable();

    let dateCounter = 0;
    let matchTotal = 0;
    const matchFrequency: [any[]] = [[]];
    const addList = [];

    if (forJobs) {
        if (total) {
            const eachJobTotal: Map<string, number> = new Map<string, number>();

            selectedJobs!.forEach((jobName) => {
                eachJobTotal.set(jobName, 0);
            });

            chartData.addColumn('string', 'Job Matched');
            chartData.addColumn('number', 'Total Matches');

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
            const eachJobList: Map<string, number>[] = [];

            chartData.addColumn('string', 'Date');

            selectedJobs!.forEach((jobName) => {
                chartData.addColumn('number', jobName);
            });

            for (const [key, value] of data) {
                if (dateCounter < data.size) {
                    const date = stringifyDate(key);
                    matchFrequency[dateCounter] = [date];

                    const jobMap = new Map<string, number>();

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
                let index = 0;

                for (const dateElement of eachJobList) {
                    matchFrequency[index].push(dateElement.get(jobName!));
                    index++;
                }
            });

            // Reorder the data to make the furthest date the top-most date
            for (const element of matchFrequency) {
                addList.unshift(element);
            }

            chartData.addRows(addList);
        }
    } else {
        if (total) {
            const eachSurveyTotal: Map<string, number> = new Map<string, number>();

            selectedSurveys!.forEach((surveyName) => {
                eachSurveyTotal.set(surveyName, 0);
            });

            chartData.addColumn('string', 'Survey Administered');
            chartData.addColumn('number', 'Total Matches');

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
            const eachSurveyList: Map<string, number>[] = [];

            chartData.addColumn('string', 'Date');

            selectedSurveys!.forEach((surveyName) => {
                chartData.addColumn('number', surveyName);
            });

            for (const [key, value] of data) {
                if (dateCounter < data.size) {
                    const date = stringifyDate(key);
                    matchFrequency[dateCounter] = [date];

                    const surveyMap = new Map<string, number>();

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
                let index = 0;

                for (const dateElement of eachSurveyList) {
                    matchFrequency[index].push(dateElement.get(surveyName!));
                    index++;
                }
            });

            // Reorder the data to make the furthest date the top-most date
            for (const element of matchFrequency) {
                addList.unshift(element);
            }

            chartData.addRows(addList);
        }
    }
    console.log(chartData);

    return chartData;
}

/**
 * Chart drawing function to handle viewing data for the average matching score of each selected job
 * since the specified date
 *
 * @param subject the subject type the data will focus on
 * @param queryType the type of query to focus the data
 * @param chartType the desired (chart) representation of the data
 * @param dateSelection the date information that will be used to start pulling data from
 * @param selectionArrays the selected list of survey/job/labels to focus the data on
 *                        depending on the subject
 */
async function drawAverageJobScores(
    subject: Subject,
    queryType: DataQuery,
    chartType: Chart,
    dateSelection: DateSelection,
    selectionArrays: SelectionArrays) {
    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;

    // Retrieve data from BigQuery
    const data: any = await getQueryData(subject, queryType, forDay, startDate, selectionArrays);

    const forJobs = queryType === DataQuery.AverageJobMatches;
    const title = 'Average Job Matches ' +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    let chartData: google.visualization.DataTable;

    switch (chartType) {
    case Chart.Line:
        chartData = prepareAverageJobScores(data, forJobs, selectionArrays);

        new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Average Score' },
                hAxis: { title: 'Day' }
            });
        break;
    case Chart.Bar:
        chartData = prepareAverageJobScores(data, forJobs, selectionArrays);

        new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Day' },
                hAxis: { title: 'Average Score' }
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

/**
 * Converts the data received from BigQuery into a format recognized by Google Charts
 *
 * *Converts data particularly for the average matching score of each selected job
 * since the specified date
 *
 * @param data the transformed data received from BigQuery
 * @returns the Google Chart-recognizable set of data
 */
function prepareAverageJobScores(
    data: Map<string, SerializedEntry[]>,
    forJobs: boolean,
    selectionArrays: SelectionArrays) {
    const selectedSurveys = selectionArrays.surveys;
    const selectedJobs = selectionArrays.jobs;

    const chartData = new google.visualization.DataTable();

    chartData.addColumn('string', 'Date');

    let dateCounter = 0;
    const matchFrequency: [any[]] = [[]];
    const addList = [];

    if (forJobs) {
        const eachJobList: Map<string, number>[] = [];

        selectedJobs!.forEach((jobName) => {
            chartData.addColumn('number', jobName);
        });

        for (const [key, value] of data) {
            if (dateCounter < data.size) {
                const date = stringifyDate(key);
                matchFrequency[dateCounter] = [date];

                const jobMap = new Map<string, number>();

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
            let index = 0;

            for (const dateElement of eachJobList) {
                matchFrequency[index].push(dateElement.get(jobName!));
                index++;
            }
        });

        // Reorder the data to make the furthest date the top-most date
        for (const element of matchFrequency) {
            addList.unshift(element);
        }

        chartData.addRows(addList);
    } else {
        const eachSurveyList: Map<string, number>[] = [];

        selectedSurveys!.forEach((surveyName) => {
            chartData.addColumn('number', surveyName);
        });

        for (const [key, value] of data) {
            if (dateCounter < data.size) {
                const date = stringifyDate(key);
                matchFrequency[dateCounter] = [date];

                const surveyMap = new Map<string, number>();

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
            let index = 0;

            for (const dateElement of eachSurveyList) {
                matchFrequency[index].push(dateElement.get(surveyName!));
                index++;
            }
        });

        // Reorder the data to make the furthest date the top-most date
        for (const element of matchFrequency) {
            addList.unshift(element);
        }

        chartData.addRows(addList);
    }

    return chartData;
}

/**
 * Chart drawing function to handle viewing data for the jobs with the highest/lowest average
 * matching scores since the specified date
 *
 * @param subject the subject type the data will focus on
 * @param queryType the type of query to focus the data
 * @param chartType the desired (chart) representation of the data
 * @param dateSelection the date information that will be used to start pulling data from
 */
async function drawTieredAverageJobScores(
    subject: Subject,
    queryType: DataQuery,
    chartType: Chart,
    dateSelection: DateSelection) {
    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;

    // Retrieve data from BigQuery
    const data: any = await getQueryData(subject, queryType, forDay, startDate);

    const highest = (queryType === DataQuery.HighestAverageJobMatches);
    const title = `${(highest ? 'Highest Scoring Jobs ' : 'Lowest Scoring Jobs ')} ` +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    let chartData: google.visualization.DataTable;

    switch (chartType) {
    case Chart.Bar:
        chartData = prepareTieredAverageJobScores(data, false);

        new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Day' },
                hAxis: { title: 'Average Score' },
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

        let minColor;
        let midColor;
        let maxColor;

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

/**
 * Converts the data received from BigQuery into a format recognized by Google Charts
 *
 * *Converts data particularly for the jobs with the highest/lowest average
 * matching scores since the specified date
 *
 * @param data the transformed data received from BigQuery
 * @returns the Google Chart-recognizable set of data
 *
 */
function prepareTieredAverageJobScores(data: SerializedEntry[], tree: boolean) {
    const chartData = new google.visualization.DataTable();

    if (tree) {
        chartData.addColumn('string', 'Job Name');
        chartData.addColumn('string', 'Parent');
        chartData.addColumn('number', 'Average Score');
        chartData.addColumn('number', 'Ranking');

        chartData.addRow(['All Jobs', null, 0, 0]);

        for (const value of data) {
            const score = (value.score! < 0) ? (-1 * value.score!) : value.score!;

            // Force negative scores to have a "lower" color than positive scores
            const colorScale = (value.score! < 0) ? (score * 50) : (score * 50 + 50);

            chartData.addRow([value.jobName!, 'All Jobs', score, colorScale]);
        }
    } else {
        chartData.addColumn('string', 'Job Name');
        chartData.addColumn('number', 'Average Score');

        for (const value of data) {
            chartData.addRow([value.jobName!, value.score!]);
        }
    }

    return chartData;
}

/**
 * Chart drawing function to handle viewing data for the matching scores for each selected label
 * since the specified date
 *
 * @param subject the subject type the data will focus on
 * @param queryType the type of query to focus the data
 * @param chartType the desired (chart) representation of the data
 * @param dateSelection the date information that will be used to start pulling data from
 * @param selectionArrays the selected list of survey/job/labels to focus the data on
 *                        depending on the subject
 */
async function drawAllLabelScores(
    subject: Subject,
    queryType: DataQuery,
    chartType: Chart,
    dateSelection: DateSelection,
    selectionArrays: SelectionArrays) {
    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;

    // Retrieve data from BigQuery
    const data: any = await getQueryData(subject, queryType, forDay, startDate, selectionArrays);

    const preparedData = prepareAllLabelScores(data);
    const chartData: google.visualization.DataTable = preparedData.chartData;
    const frequency = preparedData.frequency;
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
                vAxis: { title: 'Linear Score', minValue: 0, maxValue: 1 },
                hAxis: { title: 'Percentile Score', minValue: -1, maxValue: 1 },
                legend: 'none'
            });
        break;
    }
}

/**
 * Converts the data received from BigQuery into a format recognized by Google Charts
 *
 * *Converts data particularly for the matching scores for each selected label
 * since the specified date
 *
 * @param data the transformed data received from BigQuery
 * @returns the Google Chart-recognizable set of data
 */
function prepareAllLabelScores(data: SerializedEntry[]) {
    const chartData = new google.visualization.DataTable();

    chartData.addColumn('number', 'Linear Score');
    chartData.addColumn('number', 'Percentile Score');

    for (const value of data) {
        chartData.addRow([value.linearScore!, value.percentileScore!]);
    }

    return {
        chartData: chartData,
        frequency: data[0].labelFrequency!
    };
}

/**
 * Chart drawing function to handle viewing data for the average matching scores for each
 * selected label since the specified date
 *
 * @param subject the subject type the data will focus on
 * @param queryType the type of query to focus the data
 * @param chartType the desired (chart) representation of the data
 * @param dateSelection the date information that will be used to start pulling data from
 * @param selectionArrays the selected list of survey/job/labels to focus the data on
 *                        depending on the subject
 */
async function drawAverageLabelScores(
    subject: Subject,
    queryType: DataQuery,
    chartType: Chart,
    dateSelection: DateSelection,
    selectionArrays: SelectionArrays) {
    const forDay = dateSelection.forDay;
    const startDate = dateSelection.startDate;

    // Retrieve data from BigQuery
    const data: any = await getQueryData(subject, queryType, forDay, startDate, selectionArrays);

    const chartData: google.visualization.DataTable = prepareAverageLabelScores(data, selectionArrays.labels!);

    const title = 'Average Linear and Percentile Scores ' +
        `${forDay ? `On ${stringifyDate(startDate)}` : `Since ${stringifyDate(startDate)}`}`;

    // 2 of each (darker, lighter) -> blue, green, yellow, orange, red
    const colorArray = [
        '#3683ff', '#38afff', '#00a619', '#36ff54', '#bd8a00', '#ffd829', '#ff8b17', '#ffaf5e', '#ff2e2e', '#ff4242'
    ];

    switch (chartType) {
    case Chart.Line:
        new google.visualization.LineChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Average Score' },
                hAxis: { title: 'Day' },
                colors: colorArray,
                series: { // Make each "percentile score" line dashed instead of solid
                    1: { lineDashStyle: [7, 5] },
                    3: { lineDashStyle: [7, 5] },
                    5: { lineDashStyle: [7, 5] },
                    7: { lineDashStyle: [7, 5] },
                    9: { lineDashStyle: [7, 5] }
                }
            });
        break;
    case Chart.Bar:
        new google.visualization.BarChart(document.getElementById('chart')!)
            .draw(chartData!, {
                title: title,
                vAxis: { title: 'Day' },
                hAxis: { title: 'Average Score' },
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

/**
 * Converts the data received from BigQuery into a format recognized by Google Charts
 *
 * *Converts data particularly for the average matching scores for each
 * selected label since the specified date
 *
 * @param data the transformed data received from BigQuery
 * @returns the Google Chart-recognizable set of data
 */
function prepareAverageLabelScores(data: Map<string, SerializedEntry[]>, selectedLabels: string[]) {
    const chartData = new google.visualization.DataTable();

    chartData.addColumn('string', 'Date');

    selectedLabels.forEach((labelName) => {
        chartData.addColumn('number', `${labelName} Linear`);
        chartData.addColumn('number', `${labelName} Percentile`);
    });

    let dateCounter = 0;
    const eachScoreList: Map<string, [number, number]>[] = [];
    const scoreFrequency: [any[]] = [[]];
    const addList = [];

    for (const [key, value] of data) {
        if (dateCounter < data.size) {
            const date = stringifyDate(key);
            scoreFrequency[dateCounter] = [date];

            const scoreMap = new Map<string, [number, number]>();

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
        let index = 0;

        for (const dateElement of eachScoreList) {
            if (dateElement.get(labelName) !== undefined) {
                scoreFrequency[index].push(dateElement.get(labelName)![0]);
                scoreFrequency[index].push(dateElement.get(labelName)![1]);
            } else {
                scoreFrequency[index].push(0);
                scoreFrequency[index].push(0);
            }
            
            index++;
        }
    });

    // Reorder the data to make the furthest date the top-most date
    for (const element of scoreFrequency) {
        addList.unshift(element);
    }

    chartData.addRows(addList);

    return chartData;
}
