import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import { drawChart } from '../firebase/Analytics/Draw';
import { DataQuery, Chart, Subject, NavigatorGrouping, DateGrouping, SelectionArrays, DateSelection, dataFocusTypes, validChartInfo, today, determineStartDate } from '../firebase/Analytics/Utility';

import { authInstance } from '../firebase/Firebase';
import TooltipInfo from './TooltipInfo';


const Analytics: React.FC = () => {
    // Get data from redux
    const surveys = useAppSelector(s => s.data.surveys);
    const jobOpps = useAppSelector(s => s.data.jobOpps);
    const labels = useAppSelector(s => s.data.labels);
    const userEmail = authInstance.currentUser!.email!;
  
    // Stateful storage of the current state of the input error message
    const [popupTitleState, setPopupTitleState] = useState('');
    const [popupMessageState, setPopupMessageState] = useState('');

    // Stateful storage of query type selection, what is in current use and for each subject
    const [queryTypeState, setQueryTypeState] = useState<DataQuery>(DataQuery.AllTitles);
    const [surveyQueryTypeState, setSurveyQueryTypeState] = useState<DataQuery>(DataQuery.AllTitles);
    const [jobQueryTypeState, setJobQueryTypeState] = useState<DataQuery>(DataQuery.HighestAverageJobMatches);
    const [labelQueryTypeState, setLabelQueryTypeState] = useState<DataQuery>(DataQuery.LabelPoints);

    const [navigatorGroupingState, setNavigatorGroupingstate] = useState<NavigatorGrouping>(NavigatorGrouping.All);
    const [validDataFocusesState, setValidDataFocusesState] = useState(validChartInfo.get(Subject.Surveys)!.get(Chart.Pie)!.text);

    // Stateful storage of chart type selection: what is in current use and for each subject
    const [chartTypeState, setChartTypeState] = useState<Chart>(Chart.Pie);
    const [surveyChartTypeState, setSurveyChartTypeState] = useState(Chart.Pie);
    const [jobChartTypeState, setJobChartTypeState] = useState(Chart.TreeMap);
    const [labelChartTypeState, setLabelChartTypeState] = useState(Chart.Scatter);

    // Stateful storage of the entered in navigator emails
    const [navigatorEntryState, setNavigatorEntryState] = useState('');

    // Stateful storage of the list of navigator emails/surveys/jobs/labels to view data for
    const [selectedNavigatorState, setSelectedNavigatorState] = useState<string[]>();
    const [selectedSurveysState, setSelectedSurveysState] = useState<string[]>([]);
    const [selectedJobsState, setSelectedJobsState] = useState<string[]>([]);
    const [selectedLabelsState, setSelectedLabelsState] = useState<string[]>([]);

    // Stateful storage of which checkbox elements have been selected
    const [selectedSurveysCheckState, setSelectedSurveysCheckState] = useState<Set<string>>(new Set<string>());
    const [selectedJobsCheckState, setSelectedJobsCheckState] = useState<Set<string>>(new Set<string>());
    const [selectedLabelsCheckState, setSelectedLabelsCheckState] = useState<Set<string>>(new Set<string>());

    // Stateful storage of the selected starting date to look at data from
    const [dateGroupingState, setDateGroupingState] = useState<DateGrouping>(DateGrouping.Week);
    const [dayDateState, setDayDateState] = useState(today);
    const [sinceDateState, setSinceDateState] = useState(today);
    const [startDateState, setStartDateState] = useState(today().replaceAll('-', ''));

    // Stateful storage of the currently selected subject type
    const [subjectState, setSubjectState] = useState(Subject.Surveys);

    // (Jobs subject only) Stateful storage of the type of tree chart to be used:
    // largest data or smallest data (used to set tree informational box)
    const [treeState, setTreeState] = useState(DataQuery.None);

    // letiables to hold the currently used data that the state will be set with;
    // initialized with the previous state information
    let popupTitle = popupTitleState;
    let popupMessage = popupMessageState;
    let queryType = queryTypeState;
    let navigatorGrouping = navigatorGroupingState;
    let chartType = chartTypeState;
    let navigatorEntry = navigatorEntryState;
    const selectedSurveysCheck = selectedSurveysCheckState;
    const selectedJobsCheck = selectedJobsCheckState;
    const selectedLabelsCheck = selectedLabelsCheckState;
    let dateGrouping = dateGroupingState;
    let dayDate = dayDateState.replaceAll('-', '');
    let sinceDate = sinceDateState.replaceAll('-', '');
    let startDate = startDateState;
    let subject = subjectState;

    // letiables to check the validity of the number of surveys selected
    const maxSelectedSurveys = 5;
    let selectedSurveyCount = 0;
    const selectedSurveys = selectedSurveysState;

    let selectedNavigators = selectedNavigatorState;

    // letiables to check the validity of the number of jobs selected
    const maxSelectedJobs = 5;
    let selectedJobCount = 0;
    const selectedJobs = selectedJobsState;

    // letiables to check the validity of the number of labels selected
    const maxSelectedLabels = 5;
    let selectedLabelCount = 0;
    const selectedLabels = selectedLabelsState;

    // HTML elements necessary to immediately set data for without waiting for state update
    let validDataFocusesBox: HTMLInputElement;
    let popupTitleBox: HTMLInputElement;
    let popupMessageBox: HTMLInputElement;

    useEffect(() => {
        validDataFocusesBox = document.getElementById('valid-focuses') as HTMLInputElement;
        popupTitleBox = document.getElementById('popup-title') as HTMLInputElement;
        popupMessageBox = document.getElementById('popup-message') as HTMLInputElement;
    });

    // Sets the error box on the page with the necessary error message
    const togglePopup = () => {
        popupTitleBox!.innerHTML = popupTitle;
        popupMessageBox!.innerHTML = popupMessage;

        setPopupTitleState(popupTitle);
        setPopupMessageState(popupMessage);
    };

    google.charts.load('current', { packages: ['corechart', 'table', 'treemap'] });

    /**
     * Updates how many navigators the data should focus on
     *
     * @param value the new set of navigators to focus on
     */
    function updateNavigatorGrouping(value: NavigatorGrouping) {
        navigatorGrouping = value;

        if (value === NavigatorGrouping.All) {
            switch (queryType) {
            case DataQuery.OneTitlesPerDay:
                updateQueryType(DataQuery.AllTitlesPerDay);
                break;
            case DataQuery.OnePerDay:
                updateQueryType(DataQuery.AllPerDay);
                break;
            case DataQuery.OneTitles:
                updateQueryType(DataQuery.AllTitles);
                break;
            }
        } else {
            switch (queryType) {
            case DataQuery.AllTitlesPerDay:
                updateQueryType(DataQuery.OneTitlesPerDay);
                break;
            case DataQuery.AllPerDay:
                updateQueryType(DataQuery.OnePerDay);
                break;
            case DataQuery.AllTitles:
                updateQueryType(DataQuery.OneTitles);
                break;
            }
        }

        setNavigatorGroupingstate(value);
    }

    /**
     * Updates the letiables keeping track of the emails the
     * user enters in in the navigators text box
     *
     * @param value the entered in string by the user
     */
    function updateNavigatorEntry(value: string) {
        navigatorEntry = value;
        setNavigatorEntryState(value);
    }

    /**
     * Updates the data query that will be used to retrieve data
     * and updates the state
     *
     * @param value the new query to pull data with
     */
    function updateQueryType(value: DataQuery) {
        queryType = value;

        switch (subject) {
        case Subject.Surveys:
            setSurveyQueryTypeState(value);
            break;
        case Subject.Jobs:
            setJobQueryTypeState(value);
            break;
        case Subject.Labels:
            setLabelQueryTypeState(value);
            break;
        }

        setQueryTypeState(value);
    }

    /**
     * Updates the chart type that will be used to display the data and updates the state
     *
     * @param value the new chart to display the data on
     */
    function updateChartType(value: Chart) {
        chartType = value;

        switch (subject) {
        case Subject.Surveys:
            setSurveyChartTypeState(value);
            break;
        case Subject.Jobs:
            setJobChartTypeState(value);
            break;
        case Subject.Labels:
            setLabelChartTypeState(value);
            break;
        }

        // Displays which queries (data focuses) the selected chart is able to display
        const validChartTypeText = validChartInfo.get(subject)!.get(value)!.text;

        validDataFocusesBox.innerHTML = validChartTypeText;

        setChartTypeState(value);
        setValidDataFocusesState(validChartTypeText);
    }

    /**
     * Updates the starting date type that the data should begin from: a
     * specific day, a week back, a month back, or starting from a specific date
     * and updates the state
     *
     * @param value the new starting date type
     */
    function updateDateGrouping(value: DateGrouping) {
        dateGrouping = value;
        setDateGroupingState(value);
    }

    /**
     * Updates the actual date that the data will start at based on a
     * selected date, sanitizing the date string into a form
     * recognizable by BigQuery (i.e., YYYYMMDD)
     *
     * @param value the new starting date string in HTML date input format
     * @param rangeType the starting date type of the selected starting date
     */
    function updateDate(value: string, rangeType: DateGrouping) {
        if (rangeType === DateGrouping.Day) {
            dayDate = value.replaceAll('-', '');
            setDayDateState(value);
        } else {
            sinceDate = value.replaceAll('-', '');
            setSinceDateState(value);
        }
    }

    /**
     * Updates the subject that the data should focus on (surveys, jobs, or labels)
     * and updates the state
     *
     * @param value the new subject of the data
     */
    function updateSubject(value: Subject) {
        subject = value;

        switch (value) {
        case Subject.Surveys:
            updateQueryType(surveyQueryTypeState);
            updateChartType(surveyChartTypeState);
            break;
        case Subject.Jobs:
            updateQueryType(jobQueryTypeState);
            updateChartType(jobChartTypeState);
            break;
        case Subject.Labels:
            updateQueryType(labelQueryTypeState);
            updateChartType(labelChartTypeState);
            break;
        }

        setSubjectState(value);
    }

    /**
     * Checks that the entered in navigator emails are in a valid format
     * (i.e., separated by commas and there are enough characters in each email).
     *
     * @returns whether typed in navigator emails are in a valid format
     */
    function validateNavigatorEntry(): boolean {
        selectedNavigators = [];

        const navigators: string[] = navigatorEntry.split(',');

        if (navigators.length > 5) {
            return false;
        } else {
            if (navigatorGrouping === NavigatorGrouping.Set && navigators.length < 2) {
                setSelectedNavigatorState(selectedNavigators);
                return false;
            }

            for (const entry of navigators) {
                const adjustedEntry = entry.trim();

                if (adjustedEntry.length < 5) {
                    selectedNavigators = [];

                    setSelectedNavigatorState(selectedNavigators);
                    return false;
                }

                setSelectedNavigatorState(selectedNavigators);
                selectedNavigators.push(adjustedEntry);
            }

            return true;
        }
    }

    /**
     * Updates the list of survey, job, or label names that will be used to pull data for
     * based on the currently selected subject, ensuring that only a maximum of 5 are selected
     * at any given time.
     *
     * @param subjectSelected the subject that the data focuses on
     * @param name the name of the survey/job/label to add/remove from the chart's
     *                   survey/job/label data
     * @param checked whether or not the checkbox for a given survey/job/label has just been
     *                selected or deselected
     */
    function handleClick(subjectSelected: Subject, name: string, checked: boolean) {
        switch (subjectSelected) {
        case Subject.Surveys:
            const surveyCheckbox = document.getElementById(name) as HTMLInputElement;

            if (checked) {
                if (selectedSurveyCount < maxSelectedSurveys) {
                    selectedSurveys.push(name);
                    selectedSurveysCheck.add(name);

                    selectedSurveysCheckState.add(name);
                    setSelectedSurveysCheckState(selectedSurveysCheckState);

                    selectedSurveyCount++;
                }
            } else {
                const removeIndex = selectedSurveys.indexOf(name);
                selectedSurveys.splice(removeIndex, 1);
                selectedSurveysCheck.delete(name);

                selectedSurveysCheckState.delete(name);
                setSelectedSurveysCheckState(selectedSurveysCheckState);

                selectedSurveyCount--;
            }

            setSelectedSurveysState(selectedSurveys);

            surveyCheckbox.checked = selectedSurveysCheck.has(name);

            break;
        case Subject.Jobs:
            const jobCheckbox = document.getElementById(name) as HTMLInputElement;

            if (checked) {
                if (selectedJobCount < maxSelectedJobs) {
                    selectedJobs.push(name);
                    selectedJobsCheck.add(name);

                    selectedJobsCheckState.add(name);
                    setSelectedJobsCheckState(selectedJobsCheckState);

                    selectedJobCount++;
                }
            } else {
                const removeIndex = selectedJobs.indexOf(name);
                selectedJobs.splice(removeIndex, 1);
                selectedJobsCheck.delete(name);

                selectedJobsCheckState.delete(name);
                setSelectedJobsCheckState(selectedJobsCheckState);

                selectedJobCount--;
            }

            setSelectedJobsState(selectedJobs);

            jobCheckbox.checked = selectedJobsCheck.has(name);

            break;
        case Subject.Labels:
            const labelCheckbox = document.getElementById(name) as HTMLInputElement;

            if (checked) {
                if (selectedLabelCount < maxSelectedLabels) {
                    selectedLabels.push(name);
                    selectedLabelsCheck.add(name);

                    selectedLabelsCheckState.add(name);
                    setSelectedLabelsCheckState(selectedLabelsCheckState);

                    selectedLabelCount++;
                }
            } else {
                const removeIndex = selectedLabels.indexOf(name);
                selectedLabels.splice(removeIndex, 1);
                selectedLabelsCheck.delete(name);

                selectedLabelsCheckState.delete(name);
                setSelectedLabelsCheckState(selectedLabelsCheckState);

                selectedLabelCount--;
            }

            setSelectedLabelsState(selectedLabels);

            labelCheckbox.checked = selectedLabelsCheck.has(name);

            break;
        }
    }

    /**
     * Begins the chart generation process
     */
    const generateChart = async() => {
        // Resets the displayed error message
        popupTitle = '';
        popupMessage = '';
        togglePopup();

        // Retrieves the BigQuery-recognizable start date
        startDate = determineStartDate(dateGrouping, dayDate, sinceDate);

        // Updates the starting date state
        setStartDateState(startDate);

        if (queryType === DataQuery.None) {
            return;
        }

        if (navigatorGrouping !== NavigatorGrouping.All) {
            const validNavigatorEntry = validateNavigatorEntry();

            if (!validNavigatorEntry) {
                popupTitle = 'Invalid Navigator Email Entry';
                popupMessage = 'For one navigator: Please enter at least one email<br />' +
                    'For a set of navigators: Please enter at least two emails and separate by commas.';
                togglePopup();

                return;
            }
        }

        if (((queryType & DataQuery.RequiresSurveyName) !== 0) && selectedSurveys.length === 0) {
            popupTitle = 'Empty Survey Selection';
            popupMessage = 'Please select at least one survey you would like to see data for.';
            togglePopup();

            return;
        }

        if (subject === Subject.Jobs && ((queryType & DataQuery.RequiresJobName) !== 0) && selectedJobs.length === 0) {
            popupTitle = 'Empty Job Selection';
            popupMessage = 'Please select at least one job you would like to see data for.';
            togglePopup();

            return;
        }

        if (subject === Subject.Labels) {
            if (selectedLabels.length === 0) {
                popupTitle = 'Empty Label Selection';
                popupMessage = 'Please select at least one label you would like to see data for.';
                togglePopup();

                return;
            } else if (queryType === DataQuery.LabelPoints && selectedLabels.length > 1) {
                popupTitle = 'Invalid Label Selection';
                popupMessage = 'Please select at most one label for this data focus.';
                togglePopup();

                return;
            }
        }

        if (!(validChartInfo.get(subject)!.get(chartType)!.list!.includes(queryType))) {
            popupTitle = 'Invalid Chart Type';
            popupMessage = 'Selected chart type is incompatible with your selected data focus.';
            togglePopup();

            return;
        }

        try {
            // Sets the Tree Map chart type state to update its informational box
            if (((queryType & DataQuery.RequiresJobName) === 0) && chartType === Chart.TreeMap) {
                setTreeState(queryType);
            } else {
                setTreeState(DataQuery.None);
            }

            const selectionArrays: SelectionArrays = {
                navigators: selectedNavigators,
                surveys: selectedSurveys,
                jobs: selectedJobs,
                labels: selectedLabels
            };

            const dateSelection: DateSelection = {
                forDay: (dateGrouping === DateGrouping.Day),
                startDate: startDate
            };

            // Entry point into the chart drawing
            await drawChart(subject, chartType, queryType, (navigatorGrouping === NavigatorGrouping.All), dateSelection, selectionArrays);
        } catch (error) {
            const { details } = JSON.parse(JSON.stringify(error));

            popupTitle = 'Query Error';
            popupMessage = details;
            togglePopup();
        }
    };

    return (
        <div id='analytics'>
            <div className='topGrid'>
                <div className='middleColumn left'>
                    <div className='listViewer'>
                        <div className='title'>
                            Data Configuration
                            <TooltipInfo textarea={'Section to refine and configure the focus and type of data you would like to view.'}></TooltipInfo>
                        </div>
                        <p>Subject:</p>
                        <input type='radio' id='surveys-administered' name='subject' defaultChecked={subjectState === Subject.Surveys} onClick={() => { updateSubject(Subject.Surveys); }}></input>
                        <label htmlFor='surveys-administered'>Administered Surveys </label>
                        <input type='radio' id='jobs-matched' name='subject' defaultChecked={subjectState === Subject.Jobs} onClick={() => { updateSubject(Subject.Jobs); }}></input>
                        <label htmlFor='jobs-matched'>Matched Jobs </label>
                        <input type='radio' id='labels-used' name='subject' defaultChecked={subjectState === Subject.Labels} onClick={() => { updateSubject(Subject.Labels); }}></input>
                        <label htmlFor='labels-used'>Used Labels </label>

                        <p>Date Range:</p>
                        <input type='radio' id='since' name='date' defaultChecked={dateGroupingState === DateGrouping.Since} onClick={() => { updateDateGrouping(DateGrouping.Since); }}></input>
                        <label htmlFor='since'>Since </label>
                        <input type='date' id='data-date-since' defaultValue={sinceDateState} onChange={(e) => { updateDate(e.target.value, DateGrouping.Since); }}></input>
                        <input type='radio' id='month' name='date' defaultChecked={dateGroupingState === DateGrouping.Month} onClick={() => { updateDateGrouping(DateGrouping.Month); }}></input>
                        <label htmlFor='week'>Past 31 days </label>
                        <input type='radio' id='week' name='date' defaultChecked={dateGroupingState === DateGrouping.Week} onClick={() => { updateDateGrouping(DateGrouping.Week); }}></input>
                        <label htmlFor='week'>Past 7 days </label>
                        <input type='radio' id='day' name='date' defaultChecked={dateGroupingState === DateGrouping.Day} onClick={() => { updateDateGrouping(DateGrouping.Day); }}></input>
                        <label htmlFor='day'>One day: </label>
                        <input type='date' id='data-date-day' defaultValue={dayDateState} onChange={(e) => { updateDate(e.target.value, DateGrouping.Day); }}></input>

                        {
                            subject === Subject.Surveys &&
                            <>
                                <p>Navigator Focus:</p>
                                <input type='radio' id='all-navigators' name='navigator-grouping' defaultChecked={navigatorGroupingState === NavigatorGrouping.All} onClick={() => { updateNavigatorGrouping(NavigatorGrouping.All); }}></input>
                                <label htmlFor='all-navigators'>All Navigators </label>
                                {/* <input type='radio' id='set-navigators' name='navigator-grouping' onClick={() => { navigatorGrouping = NavigatorGrouping.Set}}></input>
                                <label htmlFor='set-navigators'>Set of Navigators</label><br></br> */}
                                <input type='radio' id='one-navigator' name='navigator-grouping' defaultChecked={navigatorGroupingState === NavigatorGrouping.One} onClick={() => { updateNavigatorGrouping(NavigatorGrouping.One); }}></input>
                                <label htmlFor='one-navigator'>One Navigator</label><br></br>
                                {
                                    navigatorGrouping === NavigatorGrouping.One &&
                                    <>
                                        <br></br><input className='navigatorText' type='text' id='navigator-emails' defaultValue={navigatorEntryState.length > 0 ? navigatorEntryState : undefined} placeholder={userEmail} onChange={(e) => { updateNavigatorEntry(e.target.value); }}></input>
                                        <p className='availableWarning'>*Enter a maximum of 5 emails, separate by commas if more than one.</p>
                                    </>
                                }

                                <p>Data Focus:</p>
                                <label htmlFor='data-focus'>Administration of </label>
                                <select id='data-focus' name='Query Types' defaultValue={surveyQueryTypeState} onChange={(e) => { updateQueryType(parseInt(e.target.value)); }}>
                                    <option value={(navigatorGrouping === NavigatorGrouping.All ? DataQuery.AllTitlesPerDay : DataQuery.OneTitlesPerDay)}>{dataFocusTypes.surveys.titleDay}</option>
                                    <option value={(navigatorGrouping === NavigatorGrouping.All ? DataQuery.AllPerDay : DataQuery.OnePerDay)}>{dataFocusTypes.surveys.perDay}</option>
                                    <option value={(navigatorGrouping === NavigatorGrouping.All ? DataQuery.AllTitles : DataQuery.OneTitles)}>{dataFocusTypes.surveys.titles}</option>
                                </select>
                                <label htmlFor='data-focus'>Over the Date Range</label>
                            </>
                        }
                        {
                            subject === Subject.Jobs &&
                            <>
                                <p>Data Focus: </p>
                                <select id='data-focus' name='Query Types' defaultValue={jobQueryTypeState} onChange={(e) => { updateQueryType(parseInt(e.target.value)); }}>
                                    <option value={DataQuery.TotalJobMatches}>{dataFocusTypes.jobs.totalPerJob}</option>
                                    <option value={DataQuery.PositiveJobMatches}>{dataFocusTypes.jobs.totalPositivePerJob}</option>
                                    <option value={DataQuery.NegativeJobMatches}>{dataFocusTypes.jobs.totalNegativePerJob}</option>
                                    <option value={DataQuery.AverageJobMatches}>{dataFocusTypes.jobs.averagePerJob}</option>
                                    <option value={DataQuery.HighestAverageJobMatches}>{dataFocusTypes.jobs.highestAverage}</option>
                                    <option value={DataQuery.LowestAverageJobMatches}>{dataFocusTypes.jobs.lowestAverage}</option>
                                    <option value={DataQuery.SurveyPositiveJobMatches}>{dataFocusTypes.jobs.totalPositivePerSurvey}</option>
                                    <option value={DataQuery.SurveyNegativeJobMatches}>{dataFocusTypes.jobs.totalNegativePerSurvey}</option>
                                    <option value={DataQuery.AverageSurveyMatches}>{dataFocusTypes.jobs.averagePerSurvey}</option>
                                </select>
                                <label htmlFor='data-focus'>Over the Date Range</label>
                            </>
                        }

                        {
                            subject === Subject.Labels &&
                            <>
                                <p>Data Focus: </p>
                                <select id='data-focus' name='Query Types' defaultValue={labelQueryTypeState} onChange={(e) => { updateQueryType(parseInt(e.target.value)); }}>
                                    <option value={DataQuery.LabelPoints}>{dataFocusTypes.labels.allPoints}</option>
                                    <option value={DataQuery.LabelAverage}>{dataFocusTypes.labels.average}</option>
                                </select>
                                <label htmlFor='data-focus'>Over the Date Range</label>
                            </>
                        }

                        {
                            subject === Subject.Jobs &&
                            <>
                                <p>Available Jobs:</p>
                                <p className='availableWarning'>*Select a maximum of 5 job opportunities.</p>
                                <div className='surveyList listViewer'>
                                    <div className='listElements'>
                                        {jobOpps.length > 0
                                            ? jobOpps.map((jobOpp, ind) => {
                                                return <div key={ind}>
                                                    <input type='checkbox' id={jobOpp.jobName} value={jobOpp.jobName} defaultChecked={selectedJobsCheckState.has(jobOpp.jobName)} onChange={(e) => { handleClick(Subject.Jobs, jobOpp.jobName, e.target.checked); }}></input>
                                                    <label htmlFor={jobOpp.jobName}>{jobOpp.jobName}</label>
                                                </div>;
                                            })
                                            : <div>There are no job opportunities at the moment</div>
                                        }
                                    </div>
                                </div>
                            </>
                        }

                        {
                            subject === Subject.Labels &&
                            <>
                                <p>Available Labels:</p>
                                <p className='availableWarning'>*Select a maximum of 5 labels.</p>
                                <div className='surveyList listViewer'>
                                    <div className='listElements'>
                                        {labels.length > 0
                                            ? labels.map((label, ind) => {
                                                return <div key={ind}>
                                                    <input type='checkbox' id={label.name} value={label.name} defaultChecked={selectedLabelsCheckState.has(label.name)} onChange={(e) => { handleClick(Subject.Labels, label.name, e.target.checked); }}></input>
                                                    <label htmlFor={label.name}>{label.name}</label>
                                                </div>;
                                            })
                                            : <div>There are no labels at the moment</div>
                                        }
                                    </div>
                                </div>
                            </>
                        }

                        {
                            subject !== Subject.Labels &&
                            <>
                                <p>Available Surveys:</p>
                                <p className='availableWarning'>*Select a maximum of 5 survey titles.</p>
                                <div className='surveyList listViewer'>
                                    <div className='listElements'>
                                        {surveys.length > 0
                                            ? surveys.map((survey, ind) => {
                                                return <div key={ind}>
                                                    <input type='checkbox' id={survey.title} value={survey.title} defaultChecked={selectedSurveysCheckState.has(survey.title)} onChange={(e) => { handleClick(Subject.Surveys, survey.title, e.target.checked); }}></input>
                                                    <label htmlFor={survey.title}>{survey.title}</label>
                                                </div>;
                                            })
                                            : <div>There are no survey templates at the moment</div>
                                        }
                                    </div>
                                </div>
                            </>
                        }

                    </div>
                </div>

                <div className='middleColumn right'>
                    <div className='listViewer top'>
                        <div className='title'>
                            Chart Generation
                            <TooltipInfo textarea={'Section to select which format your would like to view your configured data in and tell you which data focuses are supported by your selected chart type.'}></TooltipInfo>
                        </div>
                        <div className='chartGenerationContainer'>
                            <div className='chartTypeContainer center'>
                                <div className='chartInfoHeader center'>Chart Type</div><br></br>
                                <div className='generateBox center'>
                                    {
                                        subjectState === Subject.Surveys &&
                                    <>
                                        <select id='chart-types' defaultValue={surveyChartTypeState} name='Chart Types' onChange={(e) => { updateChartType(parseInt(e.target.value)); }}>
                                            <option value={Chart.Pie}>Pie</option>
                                            <option value={Chart.Combo}>Combo</option>
                                            <option value={Chart.Line}>Line</option>
                                            <option value={Chart.Bar}>Bar</option>
                                            <option value={Chart.Table}>Table</option>
                                        </select>
                                    </>
                                    }
                                    {
                                        subjectState === Subject.Jobs &&
                                    <>
                                        <select id='chart-types' defaultValue={jobChartTypeState} name='Chart Types' onChange={(e) => { updateChartType(parseInt(e.target.value)); }}>
                                            <option value={Chart.Pie}>Pie</option>
                                            <option value={Chart.Line}>Line</option>
                                            <option value={Chart.Bar}>Bar</option>
                                            <option value={Chart.Table}>Table</option>
                                            <option value={Chart.TreeMap}>Tree Map</option>
                                        </select>
                                    </>
                                    }
                                    {
                                        subjectState === Subject.Labels &&
                                    <>
                                        <select id='chart-types' defaultValue={labelChartTypeState} name='Chart Types' onChange={(e) => { updateChartType(parseInt(e.target.value)); }}>
                                            <option value={Chart.Line}>Line</option>
                                            <option value={Chart.Bar}>Bar</option>
                                            <option value={Chart.Table}>Table</option>
                                            <option value={Chart.Scatter}>Scatter Plot</option>
                                        </select>
                                    </>
                                    }
                                    <br></br><br></br>
                                    <button className='generate-button' onClick={generateChart}>Generate</button>
                                </div>
                            </div>

                            <div className='chartValidityContainer'>
                                <div className='chartInfoHeader center'>Chart Validity</div>
                                <p className='validFocusesHeader center'>Valid Data Focuses:</p>
                                <p id='valid-focuses' className='validFocuses center'>{validDataFocusesState}</p>
                                <p id='popup-title' className='popup popupTitle center'>{popupTitleState}</p>
                                <p id='popup-message' className='popup center'>{popupMessageState}</p>
                            </div>
                        </div>

                    </div>
                    <div className='listViewer bottom'>
                        <div className='title'>
                            Your Chart!
                            <TooltipInfo textarea={'Your configured chart! *It may take a view seconds for the chart to finish rendering.'}></TooltipInfo>
                        </div>
                        {
                            treeState === DataQuery.LowestAverageJobMatches &&
                            <>
                                <TooltipInfo textarea='The size of the box is how large the absolute value of the average is. Red (relative lowest average) -> Yellow (relative highest average)'></TooltipInfo>
                            </>
                        }
                        {
                            treeState === DataQuery.HighestAverageJobMatches &&
                            <>
                                <TooltipInfo textarea='The size of the box is how large the absolute value of the average is. Green (relative lowest average) -> Blue (relative highest average)'></TooltipInfo>
                            </>
                        }
                        {
                            subjectState === Subject.Labels &&
                            <>
                                <TooltipInfo textarea='The linear score average should center around 1 and the percentile score average should center around 0. A tendency towards another value could indicate bias in the label usage.'></TooltipInfo>
                            </>
                        }
                        <div className='chartContainer' id='chart'></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Analytics;
