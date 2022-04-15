import React, { useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import { drawChart } from '../firebase/Analytics/Draw';
import { DataQuery, Chart, Subject, NavigatorGrouping, DateGrouping, SelectionArrays, DateSelection } from '../firebase/Analytics/Utility';
import { dataFocusTypes, validChartInfo, today, determineStartDate } from '../firebase/Analytics/Utility';
import { authInstance } from '../firebase/Firebase';


const Analytics: React.FC = () => {
    const surveys = useAppSelector(s => s.data.surveys);
    const jobOpps = useAppSelector(s =>  s.data.jobOpps);
    const labels = useAppSelector(s => s.data.labels);
    const userEmail = authInstance.currentUser!.email!;
  
    const [popupTitleState, setPopupTitleState] = useState("");
    const [popupMessageState, setPopupMessageState] = useState("");

    const [queryTypeState, setQueryTypeState] = useState<DataQuery>(DataQuery.AllTitles);
    const [surveyQueryTypeState, setSurveyQueryTypeState] = useState<DataQuery>(DataQuery.AllTitles);
    const [jobQueryTypeState, setJobQueryTypeState] = useState<DataQuery>(DataQuery.HighestAverageJobMatches);
    const [labelQueryTypeState, setLabelQueryTypeState] = useState<DataQuery>(DataQuery.LabelPoints);

    const [navigatorGroupingState, setNavigatorGroupingstate] = useState<NavigatorGrouping>(NavigatorGrouping.All);
    const [validDataFocusesState, setValidDataFocusesState] = useState(validChartInfo.get(Subject.Surveys)!.get(Chart.Pie)!.text);

    const [chartTypeState, setChartTypeState] = useState<Chart>(Chart.Pie);
    const [surveyChartTypeState, setSurveyChartTypeState] = useState(Chart.Pie);
    const [jobChartTypeState, setJobChartTypeState] = useState(Chart.TreeMap);
    const [labelChartTypeState, setLabelChartTypeState] = useState(Chart.Scatter);

    const [navigatorEntryState, setNavigatorEntryState] = useState("");
    const [selectedNavigatorState, setSelectedNavigatorState] = useState<string[]>();
    const [selectedSurveysState, setSelectedSurveysState] = useState<string[]>([]);
    const [selectedSurveysCheckState, setSelectedSurveysCheckState] = useState<Set<string>>(new Set<string>());
    const [selectedJobsState, setSelectedJobsState] = useState<string[]>([]);
    const [selectedJobsCheckState, setSelectedJobsCheckState] = useState<Set<string>>(new Set<string>());
    const [selectedLabelsState, setSelectedLabelsState] = useState<string[]>([]);
    const [selectedLabelsCheckState, setSelectedLabelsCheckState] = useState<Set<string>>(new Set<string>());

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
    var chartType = chartTypeState;
    var navigatorEntry = navigatorEntryState;
    var selectedSurveysCheck = selectedSurveysCheckState;
    var selectedJobsCheck = selectedJobsCheckState;
    var selectedLabelsCheck = selectedLabelsCheckState;
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
    var selectedNavigators = selectedNavigatorState;

    const maxSelectedJobs = 5;
    var selectedJobCount = 0;
    var selectedJobs = selectedJobsState;

    const maxSelectedLabels = 5;
    var selectedLabelCount = 0;
    var selectedLabels = selectedLabelsState;

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

        const validChartTypeText = validChartInfo.get(subject)!.get(value)!.text;

        validDataFocusesBox.innerHTML = validChartTypeText;

        setChartTypeState(value);
        setValidDataFocusesState(validChartTypeText);
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

        startDate = determineStartDate(dateGrouping, dayDate, sinceDate);

        setQueryTypeState(queryType);
        setStartDateState(startDate);
        setSelectedNavigatorState(selectedNavigators);
        
        const queryRequiresSurveyName = [
            DataQuery.AllTitlesPerDay, 
            DataQuery.AverageSurveyMatches,
            DataQuery.SurveyPositiveJobMatches, 
            DataQuery.SurveyNegativeJobMatches
        ].includes(queryType);

        const jobQueryDoesNotRequireJobName = [
            DataQuery.HighestAverageJobMatches, 
            DataQuery.LowestAverageJobMatches
        ].includes(queryType);

        const queryDoesNotRequireNavigatorName = [
            NavigatorGrouping.All
        ].includes(navigatorGrouping);

        if (queryType === DataQuery.None) {
            return;
        }

        if (!queryDoesNotRequireNavigatorName) {
            const validNavigatorEntry = validateNavigatorEntry();

            if (!validNavigatorEntry) {
                popupTitle = "Invalid Navigator Email Entry";
                popupMessage = "For one navigator: Please enter at least one email<br />" +
                    "For a set of navigators: Please enter at least two emails and separate by commas.";
                togglePopup();

                return;
            }
        }

        if (queryRequiresSurveyName && selectedSurveys.length === 0) {
            popupTitle = "Empty Survey Selection";
            popupMessage = "Please select at least one survey you would like to see data for.";  
            togglePopup();
            
            return;
        } 
        
        if (subject === Subject.Jobs && !jobQueryDoesNotRequireJobName && selectedJobs.length === 0) {
            popupTitle = "Empty Job Selection";
            popupMessage = "Please select at least one job you would like to see data for.";
            togglePopup();

            return;
        }
        console.log(selectedLabelCount);
        console.log(selectedLabels);

        if (subject === Subject.Labels) {
            if (selectedLabels.length === 0) {
                popupTitle = "Empty Label Selection";
                popupMessage = "Please select at least one label you would like to see data for.";
                togglePopup();
    
                return;
            } else if (queryType === DataQuery.LabelPoints && selectedLabels.length > 1) {
                popupTitle = "Invalid Label Selection";
                popupMessage = "Please select at most one label for this data focus.";
                togglePopup();
    
                return;
            }
        }   

        if (!validChartInfo.get(subject)!.get(chartType)!.list!.includes(queryType)) {
            popupTitle = "Invalid Chart Type";
            popupMessage = `Selected chart type is incompatible with your selected data focus.`;
            togglePopup();  

            return;
        }

        try {
            if (jobQueryDoesNotRequireJobName && chartType === Chart.TreeMap) {
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

            await drawChart(subject, chartType, queryType, queryDoesNotRequireNavigatorName, dateSelection, selectionArrays);
        } catch (error) {
            const { details } = JSON.parse(JSON.stringify(error));

            popupTitle = "Query Error";
            popupMessage = details;
            togglePopup();
        }
    }

    return (
        <div id='analytics'>
            <div className='topGrid'>  
                <div className='middleColumn left'>
                    <div className='listViewer'>
                        <div className='title'>Data Configuration</div>
                        <p>Subject:</p>
                        <input type="radio" id='surveys-administered' name='subject' defaultChecked={subjectState === Subject.Surveys} onClick={() => { updateSubject(Subject.Surveys) }}></input>
                        <label htmlFor='surveys-administered'>Administered Surveys </label>
                        <input type="radio" id='jobs-matched' name='subject' defaultChecked={subjectState === Subject.Jobs} onClick={() => { updateSubject(Subject.Jobs) }}></input>
                        <label htmlFor='jobs-matched'>Matched Jobs </label>
                        <input type="radio" id='labels-used' name='subject' defaultChecked={subjectState === Subject.Labels} onClick={() => { updateSubject(Subject.Labels) }}></input>
                        <label htmlFor='labels-used'>Used Labels </label>

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
                            subject === Subject.Surveys &&
                            <>
                                <p>Navigator Focus:</p>
                                <input type="radio" id='all-navigators' name='navigator-grouping' defaultChecked={navigatorGroupingState === NavigatorGrouping.All} onClick={() => { updateNavigatorGrouping(NavigatorGrouping.All) }}></input>
                                <label htmlFor='all-navigators'>All Navigators </label>
                                {/* <input type="radio" id='set-navigators' name='navigator-grouping' onClick={() => { navigatorGrouping = NavigatorGrouping.Set}}></input>
                                <label htmlFor='set-navigators'>Set of Navigators</label><br></br> */}
                                <input type="radio" id='one-navigator' name='navigator-grouping' defaultChecked={navigatorGroupingState === NavigatorGrouping.One} onClick={() => { updateNavigatorGrouping(NavigatorGrouping.One) }}></input>
                                <label htmlFor='one-navigator'>One Navigator</label><br></br>
                                {
                                    navigatorGrouping === NavigatorGrouping.One &&
                                    <>
                                        <br></br><input className='navigatorText' type='text' id='navigator-emails' defaultValue={navigatorEntryState.length > 0 ? navigatorEntryState : undefined} placeholder={userEmail} onChange={(e) => { updateNavigatorEntry(e.target.value) }}></input>
                                        <p className='availableWarning'>*Enter a maximum of 5 emails, separate by commas if more than one.</p>
                                    </>
                                }
                                
                                <p>Data Focus:</p>
                                <label htmlFor='data-focus'>Administration of </label>
                                <select id="data-focus" name="Query Types" defaultValue={surveyQueryTypeState} onChange={(e) => { updateQueryType(parseInt(e.target.value)) }}>
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
                                <select id="data-focus" name="Query Types" defaultValue={jobQueryTypeState} onChange={(e) => { updateQueryType(parseInt(e.target.value)) }}>
                                    <option value={DataQuery.TotalJobMatches}>{dataFocusTypes.jobs.totalPerJob}</option>
                                    <option value={DataQuery.PositiveJobMatches}>{dataFocusTypes.jobs.totalPositivePerJob}</option>
                                    <option value={DataQuery.NegativeJobMatches}>{dataFocusTypes.jobs.totalNegativePerJob}</option>
                                    <option value={DataQuery.AverageJobMatches}>{dataFocusTypes.jobs.averagePerJob}</option>
                                    <option value={DataQuery.HighestAverageJobMatches}>{dataFocusTypes.jobs.highestAverage}</option>
                                    <option value={DataQuery.LowestAverageJobMatches}>{dataFocusTypes.jobs.lowestAverage}</option>
                                    <option value={DataQuery.AverageSurveyMatches}>{dataFocusTypes.jobs.averagePerSurvey}</option>
                                    <option value={DataQuery.SurveyPositiveJobMatches}>{dataFocusTypes.jobs.totalPositivePerSurvey}</option>
                                    <option value={DataQuery.SurveyNegativeJobMatches}>{dataFocusTypes.jobs.totalNegativePerSurvey}</option>
                                </select>
                                <label htmlFor='data-focus'>Over the Date Range</label>
                            </>
                        } 

                        {
                            subject === Subject.Labels &&
                            <>
                                <p>Data Focus: </p>
                                <select id="data-focus" name="Query Types" defaultValue={labelQueryTypeState} onChange={(e) => { updateQueryType(parseInt(e.target.value)) }}>
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
                            </>
                        }

                        {
                            subject === Subject.Labels &&
                            <>
                                <p>Available Labels:</p>
                                <p className='availableWarning'>*Select a maximum of 5 labels.</p>
                                <div className='surveyList listViewer'>
                                    <div className='listElements'>
                                    {labels.length > 0 ?
                                        labels.map((label, ind) => {
                                            return <div key={ind}>
                                                    <input type='checkbox' id={label.name} value={label.name} defaultChecked={selectedLabelsCheckState.has(label.name)} onChange={(e) => { handleClick(Subject.Labels, label.name, e.target.checked) }}></input>
                                                    <label htmlFor={label.name}>{label.name}</label>
                                                </div>
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
                            </>
                        }
                        
                    </div>
                </div>

                <div className='middleColumn right'>
                    <div className='listViewer top'>
                        <div className='title'>Chart Generation</div>
                        <div className='chartGenerationContainer'>
                        <div className='chartTypeContainer center'>
                            <div className='chartInfoHeader center'>Chart Type</div><br></br>
                            <div className='generateBox center'>
                                {
                                    subjectState === Subject.Surveys &&
                                    <>
                                        <select id="chart-types" defaultValue={surveyChartTypeState} name="Chart Types" onChange={(e) => {updateChartType(parseInt(e.target.value))}}>
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
                                        <select id="chart-types" defaultValue={jobChartTypeState} name="Chart Types" onChange={(e) => {updateChartType(parseInt(e.target.value))}}>
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
                                        <select id="chart-types" defaultValue={labelChartTypeState} name="Chart Types" onChange={(e) => {updateChartType(parseInt(e.target.value))}}>
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
                            <p id="popup-title" className='popup popupTitle center'>{popupTitleState}</p>
                            <p id="popup-message" className='popup center'>{popupMessageState}</p>
                        </div>
                            </div>
                        
                    </div>
                    <div className='listViewer bottom'>
                        <div className='title'>Your Chart!</div>
                        {
                            treeState === DataQuery.LowestAverageJobMatches &&
                            <>
                               <p>The size of the box is how large the absolute value of the average is.</p>
                               <p>Red (relative lowest average) {"->"} Yellow (relative highest average)</p>
                            </>
                        }
                        {
                            treeState === DataQuery.HighestAverageJobMatches &&
                            <>
                               <p>The size of the box is how large the absolute value of the average is.</p>
                               <p>Green (relative lowest average) {"->"} Blue (relative highest average)</p>
                            </>
                        }
                        <div className='chartContainer' id="chart"></div>
                    </div>
                </div>
            </div>
    </div>
    )
}


export default Analytics;
