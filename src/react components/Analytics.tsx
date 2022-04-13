import React, { useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import { DataQuery, Subject, NavigatorGrouping, DateGrouping, dataFocusTypes, validQueryCharts } from '../firebase/Analytics/Utility';
import { drawChart } from '../firebase/Analytics/Draw';
import { authInstance } from '../firebase/Firebase';
import { Chart, determineQueryType, validateChartType, today, determineStartDate, stringifyDate } from '../firebase/Analytics/Utility';

/** The props (arguments) to create this element */
interface props {

}

const Analytics: React.FC<props> = (props) => {
    const surveys = useAppSelector(s => s.data.surveys);
    const jobOpps = useAppSelector(s =>  s.data.jobOpps);
    const userEmail = authInstance.currentUser!.email!;
  
    const [popupTitleState, setPopupTitleState] = useState("");
    const [popupMessageState, setPopupMessageState] = useState("");
    const [queryTypeState, setQueryTypeState] = useState<DataQuery>(DataQuery.AllTitles);
    const [navigatorGroupingState, setNavigatorGroupingstate] = useState<NavigatorGrouping>(NavigatorGrouping.All);
    const [dataFocusState, setDataFocusState] = useState("");
    const [surveyDataFocusState, setSurveyDataFocusState] = useState(dataFocusTypes.surveys.titles.name);
    const [jobDataFocusState, setJobDataFocusState] = useState(dataFocusTypes.jobs.totalPerJob.name);
    const [validDataFocusesState, setValidDataFocusesState] = useState(validQueryCharts.surveys.pie.text);
    const [chartTypeState, setChartTypeState] = useState<Chart>(Chart.Pie);
    const [chartTypeNameState, setChartTypeNameState] = useState("Pie");
    const [navigatorEntryState, setNavigatorEntryState] = useState("");
    const [selectedSurveysState, setSelectedSurveysState] = useState<string[]>([]);
    const [selectedSurveysCheckState, setSelectedSurveysCheckState] = useState<Set<string>>(new Set<string>());
    const [selectedJobsState, setSelectedJobsState] = useState<string[]>([]);
    const [selectedJobsCheckState, setSelectedJobsCheckState] = useState<Set<string>>(new Set<string>());
    const [dateGroupingState, setDateGroupingState] = useState<DateGrouping>(DateGrouping.Week);
    const [dayDateState, setDayDateState] = useState(today);
    const [sinceDateState, setSinceDateState] = useState(today);
    const [startDateState, setStartDateState] = useState(today().replaceAll("-", ""));
    const [subjectState, setSubjectState] = useState(Subject.Surveys);
    const [treeState, setTreeState] = useState(DataQuery.None);

    var popupTitle = popupTitleState;
    var popupMessage = popupMessageState;
    var queryType = queryTypeState;
    var navigatorGrouping = navigatorGroupingState;
    var dataFocus = (subjectState === Subject.Surveys) ? surveyDataFocusState : jobDataFocusState;
    var validDataFocuses = validDataFocusesState;
    var chartType = chartTypeState;
    var chartTypeName = chartTypeNameState;
    var navigatorEntry = navigatorEntryState;
    var selectedSurveysCheck = selectedSurveysCheckState;
    var selectedJobsCheck = selectedJobsCheckState;
    var dateGrouping = dateGroupingState;
    var dayDate = dayDateState.replaceAll("-", "");
    var sinceDate = sinceDateState.replaceAll("-", "");
    var startDate = startDateState;
    var subject = subjectState;

    const togglePopup = () => {
        popupTitleBox!.innerHTML = popupTitle;
        popupMessageBox!.innerHTML = popupMessage;

        setPopupTitleState(popupTitle);
        setPopupMessageState(popupMessage);
    };

    const maxSelectedSurveys = 5;
    var selectedSurveyCount = 0;
    var selectedSurveys = selectedSurveysState;
    var selectedNavigators: string[] = [];

    const maxSelectedJobs = 5;
    var selectedJobCount = 0;
    var selectedJobs = selectedJobsState;

    const validDataFocusesBox = document.getElementById("valid-focuses") as HTMLInputElement;
    const popupTitleBox = document.getElementById("popup-title") as HTMLInputElement;
    const popupMessageBox = document.getElementById("popup-message") as HTMLInputElement;

    google.charts.load("current", {packages:["corechart", "table", "treemap"]});

    function updateNavigatorGrouping(value: NavigatorGrouping) {
        navigatorGrouping = value;
        setNavigatorGroupingstate(value);
    }

    function updateNavigatorEntry(value: string) {
        navigatorEntry = value;
        setNavigatorEntryState(value);
    }

    function updateDataFocus(value: string) {
        dataFocus = value;
        console.log(value);

        switch (subject) {
            case Subject.Surveys:
                setSurveyDataFocusState(value);
                break;
            case Subject.Jobs:
                setJobDataFocusState(value);
                break;
        }

        setDataFocusState(value);
    }

    function updateDateGrouping(value: DateGrouping) {
        dateGrouping = value;
        setDateGroupingState(value);
    }

    function updateDate(value: string, rangeType: DateGrouping) {
        if (rangeType === DateGrouping.Day) {
            dayDate = value.replaceAll("-", "");
            setDayDateState(value);
        } else {
            sinceDate = value.replaceAll("-", "");
            setSinceDateState(value);
        }  
    }

    function updateSubject(value: Subject) {
        subject = value;

        switch (value) {
            case Subject.Surveys:
                updateDataFocus(surveyDataFocusState);
                break;
            case Subject.Jobs:
                updateDataFocus(jobDataFocusState);
                break;
        }

        updateChartType(chartTypeName);

        setSubjectState(value);
    }

    /**
     * Updates the chosen chart selection and converts it into a format
     * recognizable by the chart drawing pipeline
     * 
     * @param value the string representation of the selected chart
     */
    function updateChartType(value: string) {
        chartTypeName = value;

        switch (subject) {
            case Subject.Surveys:
                switch(value) {
                    case 'Pie':
                        chartType = Chart.Pie;
                        validDataFocuses = validQueryCharts.surveys.pie.text;
                        break;
                    case 'Combo':
                        chartType = Chart.Combo;
                        validDataFocuses = validQueryCharts.surveys.combo.text;
                        break;
                    case 'Line':
                        chartType = Chart.Line;
                        validDataFocuses = validQueryCharts.surveys.line.text;
                        break;
                    case 'Bar':
                        chartType = Chart.Bar;
                        validDataFocuses = validQueryCharts.surveys.bar.text;
                        break;
                    default:
                        break;
                }

                break;
            case Subject.Jobs:
                switch(value) {
                    case 'Pie':
                        chartType = Chart.Pie;
                        validDataFocuses = validQueryCharts.jobs.pie.text;
                        break;
                    case 'Line':
                        chartType = Chart.Line;
                        validDataFocuses = validQueryCharts.jobs.line.text;
                        break;
                    case 'Bar':
                        chartType = Chart.Bar;
                        validDataFocuses = validQueryCharts.jobs.bar.text;
                        break;
                    case 'Table':
                        chartType = Chart.Table;
                        validDataFocuses = validQueryCharts.jobs.table.text;
                        break;
                    case 'TreeMap':
                        chartType = Chart.TreeMap;
                        validDataFocuses = validQueryCharts.jobs.treemap.text;
                        break;
                    default:
                        break;
                }

                break;
        }

        validDataFocusesBox.innerHTML = validDataFocuses;

        setChartTypeNameState(chartTypeName);
        setChartTypeState(chartType);
        setValidDataFocusesState(validDataFocuses);
    }

    /**
     * Checks that the entered in navigator emails are in a valid format
     * (i.e., separated by commas and there are enough characters in each email).
     * 
     * @returns whether typed in navigator emails are in a valid format
     */
    function validateNavigatorEntry(): boolean {
        selectedNavigators = [];

        const navigators: string[] = navigatorEntry.split(",");
        
        if (navigators.length > 5) {
            return false;
        } else {
            if (navigatorGrouping === NavigatorGrouping.Set && navigators.length < 2) {
                return false;
            }

            for (const entry of navigators) {
                const adjustedEntry = entry.trim();

                if (adjustedEntry.length < 5) {
                    selectedNavigators = [];

                    return false;
                }

                selectedNavigators.push(adjustedEntry);
            }

            return true;
        }
    }

    /**
     * Updates the list of survey names that will be used to pull data for,
     * ensuring that only a maximum of 5 surveys are selected at any given
     * time.
     * 
     * @param subjectSelected the subject that the data focuses on
     * @param name the name of the survey/job to add/remove from the chart's
     *                   survey data
     * @param checked whether or not the checkbox for a given survey has just been
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
        }     
    }

    /**
     * Begins the chart generation process. Charts will only start to be generated when the
     * following conditions are met:
     *      - A (valid) email has been entered if data for a specific navigator was desired
     *      - The desired chart type is able to represent the desired data set
     *      - At least one survey has been selected if data for a specific set of surveys was
     *        desired
     */
    const generateChart = async() => {
        popupTitle = "";
        popupMessage = "";
        togglePopup();
        
        // Determine which type of query will be sent to pull the desired data
        queryType = determineQueryType(subject, dataFocus, navigatorGrouping);

        startDate = determineStartDate(dateGrouping, dayDate, sinceDate);

        setDataFocusState(dataFocus);
        setQueryTypeState(queryType);
        setStartDateState(startDate);

        // Validate that the selected chart type is able to represent the desired data set
        const validChartType = validateChartType(subject, chartType, queryType);

        if (navigatorGrouping === NavigatorGrouping.Set || navigatorGrouping === NavigatorGrouping.One) {
            if (queryType !== DataQuery.None) {
                const validNavigatorEntry = validateNavigatorEntry();

                if (!validNavigatorEntry) {
                    popupTitle = "Invalid Navigator Email Entry";
                    popupMessage = "For one navigator: Please enter at least one email<br />For a set of navigators: Please enter at least two emails and separate by commas.";
                    togglePopup();
                } else {
                    if (validChartType!) {
                        if ((dataFocus === dataFocusTypes.surveys.titleDay.name || dataFocus.includes("Survey")) && selectedSurveys.length === 0) {
                            popupTitle = "Empty Survey Selection";
                            popupMessage = "Please select at least one survey you would like to see data for.";
                            togglePopup();
                        } else if (subject === Subject.Jobs && !(dataFocus.includes("Highest") || dataFocus.includes("Lowest")) && selectedJobs.length === 0) {
                            popupTitle = "Empty Job Selection";
                            popupMessage = "Please select at least one job you would like to see data for.";
                            togglePopup();
                        } else {
                            try {
                                if ((queryType === DataQuery.HighestAverageJobMatches || queryType == DataQuery.LowestAverageJobMatches) && chartType == Chart.TreeMap) {
                                    setTreeState(queryType);
                                } else {
                                    setTreeState(DataQuery.None);
                                }

                                await drawChart(subject, selectedSurveys, selectedJobs, chartType, queryType, false, (dateGrouping === DateGrouping.Day), startDate, selectedNavigators);
                            } catch (error) {
                                const { details } = JSON.parse(JSON.stringify(error));

                                popupTitle = "Query Error";
                                popupMessage = details;
                                togglePopup();
                            }
                        }
                    } else {
                        popupTitle = "Invalid Chart Type";
                        popupMessage = `Chart type *${chartTypeName}* is incompatible with your selected data focus.`;
                        togglePopup();
                    }
                }
            } else {
                popupTitle = "Invalid Chart Type";
                popupMessage = `Chart type *${chartTypeName}* is incompatible with your selected data focus.<br />This view is not yet available for multiple navigators!`;
                togglePopup();
            }
        } else {
            if (validChartType!) {
                if ((dataFocus === dataFocusTypes.surveys.titleDay.name || dataFocus.includes("Survey")) && selectedSurveys.length === 0) {
                    popupTitle = "Empty Survey Selection";
                    popupMessage = "Please select at least one survey you would like to see data for.";
                    togglePopup();
                } else if (subject === Subject.Jobs && !(dataFocus.includes("Highest") || dataFocus.includes("Lowest")) && selectedJobs.length === 0) {
                    popupTitle = "Empty Job Selection";
                    popupMessage = "Please select at least one job you would like to see data for.";
                    togglePopup();
                } else {
                    try {
                        if ((queryType === DataQuery.HighestAverageJobMatches || queryType == DataQuery.LowestAverageJobMatches) && chartType == Chart.TreeMap) {
                            setTreeState(queryType);
                        } else {
                            setTreeState(DataQuery.None);
                        }

                        await drawChart(subject, selectedSurveys, selectedJobs, chartType, queryType, true, (dateGrouping === DateGrouping.Day), startDate, selectedNavigators);
                    } catch (error) {
                        const { details } = JSON.parse(JSON.stringify(error));

                        popupTitle = "Query Error";
                        popupMessage = details;
                        togglePopup();
                    }
                }
            } else {
                popupTitle = "Invalid Chart Type";
                popupMessage = `Chart type *${chartTypeName}* is incompatible with your selected data focus.`;
                togglePopup();
            }
        }   
    }

    return (
        <div id='analytics'>
            <div className='topGrid'>  
                <div className='middleColumn left'>
                    <div className='listViewer bottom'>
                        <div className='title'>Data Focus</div>
                        <p>Subject:</p>
                        <input type="radio" id='surveys-administered' name='subject' defaultChecked={subjectState === Subject.Surveys} onClick={() => { updateSubject(Subject.Surveys) }}></input>
                        <label htmlFor='surveys-administered'>Administered Surveys </label>
                        <input type="radio" id='jobs-matched' name='subject' defaultChecked={subjectState === Subject.Jobs} onClick={() => { updateSubject(Subject.Jobs) }}></input>
                        <label htmlFor='jobs-matched'>Matched Jobs </label>

                        <p>Date Range:</p>
                        <input type="radio" id='since' name='date' defaultChecked={dateGroupingState === DateGrouping.Since} onClick={() => { updateDateGrouping(DateGrouping.Since) }}></input>
                        <label htmlFor='since'>Since </label>
                        <input type="date" id="data-date-since" defaultValue={sinceDateState} onChange={(e) => { updateDate(e.target.value, DateGrouping.Since) }}></input>
                        <input type="radio" id='month' name='date' defaultChecked={dateGroupingState === DateGrouping.Month} onClick={() => { updateDateGrouping(DateGrouping.Month) }}></input>
                        <label htmlFor='week'>Past 31 days </label>
                        <input type="radio" id='week' name='date' defaultChecked={dateGroupingState === DateGrouping.Week} onClick={() => { updateDateGrouping(DateGrouping.Week) }}></input>
                        <label htmlFor='week'>Past 7 days </label>
                        <input type="radio" id='day' name='date' defaultChecked={dateGroupingState === DateGrouping.Day} onClick={() => { updateDateGrouping(DateGrouping.Day) }}></input>
                        <label htmlFor='day'>One day: </label>
                        <input type="date" id="data-date-day" defaultValue={dayDateState} onChange={(e) => { updateDate(e.target.value, DateGrouping.Day) }}></input>

                        {
                            subject == Subject.Surveys &&
                            <div>
                                <p>Focus: Administration Total of...Over the Date Range</p>
                                <select id="data-focus" name="Query Types" defaultValue={surveyDataFocusState} onChange={(e) => { updateDataFocus(e.target.value) }}>
                                    <option value={dataFocusTypes.surveys.titleDay.name}>{dataFocusTypes.surveys.titleDay.text}</option>
                                    <option value={dataFocusTypes.surveys.perDay.name}>{dataFocusTypes.surveys.perDay.text}</option>
                                    <option value={dataFocusTypes.surveys.titles.name}>{dataFocusTypes.surveys.titles.text}</option>
                                </select>
                            </div>
                        }
                        {
                            subject == Subject.Jobs &&
                            <div>
                                <p>Focus: </p>
                                <select id="data-focus" name="Query Types" defaultValue={jobDataFocusState} onChange={(e) => { updateDataFocus(e.target.value) }}>
                                    <option value={dataFocusTypes.jobs.totalPerJob.name}>{dataFocusTypes.jobs.totalPerJob.text}</option>
                                    <option value={dataFocusTypes.jobs.totalPositivePerJob.name}>{dataFocusTypes.jobs.totalPositivePerJob.text}</option>
                                    <option value={dataFocusTypes.jobs.totalNegativePerJob.name}>{dataFocusTypes.jobs.totalNegativePerJob.text}</option>
                                    <option value={dataFocusTypes.jobs.averagePerJob.name}>{dataFocusTypes.jobs.averagePerJob.text}</option>
                                    <option value={dataFocusTypes.jobs.highestAverage.name}>{dataFocusTypes.jobs.highestAverage.text}</option>
                                    <option value={dataFocusTypes.jobs.lowestAverage.name}>{dataFocusTypes.jobs.lowestAverage.text}</option>
                                    <option value={dataFocusTypes.jobs.averagePerSurvey.name}>{dataFocusTypes.jobs.averagePerSurvey.text}</option>
                                    <option value={dataFocusTypes.jobs.totalPositivePerSurvey.name}>{dataFocusTypes.jobs.totalPositivePerSurvey.text}</option>
                                    <option value={dataFocusTypes.jobs.totalNegativePerSurvey.name}>{dataFocusTypes.jobs.totalNegativePerSurvey.text}</option>
                                </select>
                            </div>
                        }

                        <p style={{ fontWeight: "bold" }}>Available Surveys:</p>
                        <p style={{ color: "red" }}>*Select a maximum of 5 survey titles.</p>
                        <div className='surveyList listViewer'>
                            <div className='listElements'>
                            {surveys.length > 0 ?
                                surveys.map((survey, ind) => {
                                    return <div key={ind}>
                                            <input type='checkbox' id={survey.title} value={survey.title} defaultChecked={selectedSurveysCheckState.has(survey.title)} onChange={(e) => { handleClick(Subject.Surveys, survey.title, e.target.checked) }}></input>
                                            <label htmlFor={survey.title}>{survey.title}</label>
                                        </div>
                                })
                                : <div>There are no survey templates at the moment</div>
                            }
                            </div>
                        </div>
                            

                        {
                            subjectState == Subject.Jobs &&
                            <div>
                                <p style={{ fontWeight: "bold" }}>Available Jobs:</p>
                                <p style={{ color: "red" }}>*Select a maximum of 5 job opportunities.</p>
                                <div className='surveyList listViewer'>
                                    <div className='listElements'>
                                    {jobOpps.length > 0 ?
                                        jobOpps.map((jobOpp, ind) => {
                                            return <div key={ind}>
                                                    <input type='checkbox' id={jobOpp.jobName} value={jobOpp.jobName} defaultChecked={selectedJobsCheckState.has(jobOpp.jobName)} onChange={(e) => { handleClick(Subject.Jobs, jobOpp.jobName, e.target.checked) }}></input>
                                                    <label htmlFor={jobOpp.jobName}>{jobOpp.jobName}</label>
                                                </div>
                                        })
                                        : <div>There are no job opportunities at the moment</div>
                                    }
                                    </div>
                                </div>
                            </div>
                        }
                        
                    </div>

                    {
                        subjectState == Subject.Surveys &&
                        <div className='listViewer top'>
                            <div className='title'>Navigator Focus</div>
                            <input type="radio" id='all-navigators' name='navigator-grouping' defaultChecked={navigatorGroupingState === NavigatorGrouping.All} onClick={() => { updateNavigatorGrouping(NavigatorGrouping.All) }}></input>
                            <label htmlFor='all-navigators'>All Navigators </label>
                            {/* <input type="radio" id='set-navigators' name='navigator-grouping' onClick={() => { navigatorGrouping = NavigatorGrouping.Set}}></input>
                            <label htmlFor='set-navigators'>Set of Navigators</label><br></br> */}
                            <input type="radio" id='one-navigator' name='navigator-grouping' defaultChecked={navigatorGroupingState === NavigatorGrouping.One} onClick={() => { updateNavigatorGrouping(NavigatorGrouping.One) }}></input>
                            <label htmlFor='one-navigator'>One Navigator</label>
                            <div style={{ height: "10px"}}></div>
                            <div>
                                <label htmlFor='navigator-emails' style={{ fontWeight: "bold" }}>Navigator(s):</label>
                                <input className='navigatorText' type='text' id='navigator-emails' placeholder={userEmail} onChange={(e) => { updateNavigatorEntry(e.target.value) }}></input>
                                <p style={{ color: "red" }}>*Enter a maximum of 5 emails, separate by commas if more than one.</p>
                            </div> 
                        </div>
                    }
                    
                </div>

                <div className='middleColumn right'>
                    <div className='listViewer top'>
                        <div className='title'>Chart Type</div>
                        {
                            subjectState == Subject.Surveys &&
                            <div>
                                <select id="chart-types" defaultValue={chartTypeNameState} name="Chart Types" onChange={(e) => {updateChartType(e.target.value)}}>
                                    <option value='Pie' defaultChecked>Pie</option>
                                    <option value='Combo'>Combo</option>
                                    <option value='Line'>Line</option>
                                    <option value='Bar'>Bar</option>
                                    <option value='Table'>Table</option>
                                </select>
                            </div>
                        }
                        {
                            subjectState == Subject.Jobs &&
                            <div>
                                <select id="chart-types" defaultValue={chartTypeNameState} name="Chart Types" onChange={(e) => {updateChartType(e.target.value)}}>
                                    <option value='Pie' defaultChecked>Pie</option>
                                    <option value='Line'>Line</option>
                                    <option value='Bar'>Bar</option>
                                    <option value='Table'>Table</option>
                                    <option value='TreeMap'>Tree Map</option>
                                </select>
                            </div>
                        }

                        <div className='generateBox center'>
                            <button className='generate-button' onClick={generateChart}>Generate</button>
                            <p id="popup-title" className='popup popupTitle center'>{popupTitleState}</p>
                            <p id="popup-message" className='popup center'>{popupMessageState}</p>
                        </div>

                        <p style={{ color: "green", fontWeight: "bold" }}>Valid Data Focuses:</p>
                        <p id='valid-focuses' style={{ whiteSpace: "pre-wrap"}}>{validDataFocusesState}</p>
                    </div>
                    <div className='listViewer bottom'>
                        <div className='title'>Your Chart!</div>
                        {
                            treeState == DataQuery.LowestAverageJobMatches &&
                            <div>
                               <p>The size of the box is how large the absolute value of the average is.</p>
                               <p>Red (relative lowest average) {"->"} Yellow (relative highest average)</p>
                            </div>
                        }
                        {
                            treeState == DataQuery.HighestAverageJobMatches &&
                            <div>
                               <p>The size of the box is how large the absolute value of the average is.</p>
                               <p>Green (relative lowest average) {"->"} Blue (relative highest average)</p>
                            </div>
                        }
                        <div className='chartContainer' id="chart" style={{ height: "600px", width: "900px" }}></div>
                    </div>
                </div>
            </div>
    </div>
    )
}


export default Analytics;
