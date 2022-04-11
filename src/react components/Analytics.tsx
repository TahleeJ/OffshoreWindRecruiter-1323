import React, { useState } from 'react';
import { useAppSelector } from '../redux/hooks';
import { DataQuery, NavigatorGrouping, DateGrouping, dataFocusTypes, validQueryCharts } from '../firebase/Analytics/Utility';
import { drawChart } from '../firebase/Analytics/Draw';
import { authInstance } from '../firebase/Firebase';
import { Chart, determineQueryType, validateChartType, stringifyDate } from '../firebase/Analytics/Utility';

/** The props (arguments) to create this element */
interface props {

}

const Analytics: React.FC<props> = (props) => {
    const today = () => {
        const todayDate = new Date();
        const day = String(todayDate.getDate()).padStart(2, '0');
        const month = String(todayDate.getMonth() + 1).padStart(2, '0');
        const year = todayDate.getFullYear();
    
        const todayString = `${year}-${month}-${day}`;
    
        console.log(todayString);
        return todayString;
    }

    const surveys = useAppSelector(s => s.data.surveys);
    const userEmail = authInstance.currentUser!.email!;
  
    const [popupTitleState, setPopupTitleState] = useState("");
    const [popupMessageState, setPopupMessageState] = useState("");
    const [queryTypeState, setQueryTypeState] = useState<DataQuery>(DataQuery.AllTitles);
    const [navigatorGroupingState, setNavigatorGroupingstate] = useState<NavigatorGrouping>(NavigatorGrouping.All);
    const [dataFocusState, setDataFocusState] = useState(dataFocusTypes.titles);
    const [validDataFocusesState, setValidDataFocusesState] = useState(validQueryCharts.pie.text);
    const [chartTypeState, setChartTypeState] = useState<Chart>(Chart.Pie);
    const [chartTypeNameState, setChartTypeNameState] = useState("Pie");
    const [navigatorEntryState, setNavigatorEntryState] = useState("");
    const [selectedSurveysState, setSelectedSurveysState] = useState<string[]>([]);
    const [selectedSurveysCheckState, setSelectedSurveysCheckState] = useState<Set<string>>(new Set<string>());
    const [dateGroupingState, setDateGroupingState] = useState<DateGrouping>(DateGrouping.Week);
    const [dateState, setDateState] = useState(today);

    var popupTitle = popupTitleState;
    var popupMessage = popupMessageState;
    var queryType = queryTypeState;
    var navigatorGrouping = navigatorGroupingState;
    var dataFocus = dataFocusState;
    var validDataFocuses = validDataFocusesState;
    var chartType = chartTypeState;
    var chartTypeName = chartTypeNameState;
    var navigatorEntry = navigatorEntryState;
    var selectedSurveysCheck = selectedSurveysCheckState;
    var dateGrouping = dateGroupingState;
    var date = dateState.replaceAll("-", "");

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

    const validDataFocusesBox = document.getElementById("valid-focuses") as HTMLInputElement;
    const popupTitleBox = document.getElementById("popup-title");
    const popupMessageBox = document.getElementById("popup-message");

    google.charts.load("current", {packages:["corechart"]});

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
        setDataFocusState(value);
    }

    function updateDateGrouping(value: DateGrouping) {
        dateGrouping = value;
        setDateGroupingState(value);
    }

    function updateDate(value: string) {
        date = value.replaceAll("-", "");
        setDateState(value);
    }

    /**
     * Updates the chosen chart selection and converts it into a format
     * recognizable by the chart drawing pipeline
     * 
     * @param value the string representation of the selected chart
     */
    function updateChartType(value: string) {
        chartTypeName = value;

        switch(value) {
            case 'Pie':
                chartType = Chart.Pie;
                validDataFocuses = validQueryCharts.pie.text;
                break;
            case 'Combo':
                chartType = Chart.Combo;
                validDataFocuses = validQueryCharts.combo.text;
                break;
            case 'Line':
                chartType = Chart.Line;
                validDataFocuses = validQueryCharts.line.text;
                break;
            case 'Bar':
                chartType = Chart.Bar;
                validDataFocuses = validQueryCharts.bar.text;
                break;
            default:
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
     * @param surveyName the name of the survey to add/remove from the chart's
     *                   survey data
     * @param checked whether or not the checkbox for a given survey has just been
     *                selected or deselected
     */
    function handleClick(surveyName: string, checked: boolean) {
        const checkbox = document.getElementById(surveyName) as HTMLInputElement;

        if (checked) {
            if (selectedSurveyCount < maxSelectedSurveys) {
                selectedSurveys.push(surveyName);
                selectedSurveysCheck.add(surveyName);

                selectedSurveysCheckState.add(surveyName);
                setSelectedSurveysCheckState(selectedSurveysCheckState);

                selectedSurveyCount++;
            }
        } else {            
            const removeIndex = selectedSurveys.indexOf(surveyName);
            selectedSurveys.splice(removeIndex, 1);
            selectedSurveysCheck.delete(surveyName);

            selectedSurveysCheckState.delete(surveyName);
            setSelectedSurveysCheckState(selectedSurveysCheckState);

            selectedSurveyCount--;
        }

        setSelectedSurveysState(selectedSurveys);

        checkbox.checked = selectedSurveysCheck.has(surveyName);
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
        queryType = determineQueryType(dataFocus, navigatorGrouping);

        setDataFocusState(dataFocus);
        setQueryTypeState(queryType);

        // Validate that the selected chart type is able to represent the desired data set
        const validChartType = validateChartType(chartType, queryType);

        if (navigatorGrouping === NavigatorGrouping.Set || navigatorGrouping === NavigatorGrouping.One) {
            if (queryType !== DataQuery.None) {
                const validNavigatorEntry = validateNavigatorEntry();

                if (!validNavigatorEntry) {
                    popupTitle = "Invalid Navigator Email Entry";
                    popupMessage = "For one navigator: Please enter at least one email<br />For a set of navigators: Please enter at least two emails and separate by commas.";
                    togglePopup();
                } else {
                    if (validChartType!) {
                        if (dataFocus === dataFocusTypes.titleday && selectedSurveys.length === 0) {
                            popupTitle = "Empty Survey Selection";
                            popupMessage = "Please select at least one survey you would like to see data for.";
                            togglePopup();
                        } else {
                            try {
                                await drawChart(selectedSurveys, chartType, queryType, false, (dateGrouping === DateGrouping.Day), date, selectedNavigators);
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
                if (dataFocus === dataFocusTypes.titleday && selectedSurveys.length === 0) {
                    popupTitle = "Empty Survey Selection";
                    popupMessage = "Please select at least one survey you would like to see data for.";
                    togglePopup();
                } else {
                    try {
                        await drawChart(selectedSurveys, chartType, queryType, true, (dateGrouping === DateGrouping.Day), date, selectedNavigators);
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
                    <div className='listViewer top'>
                        <div className='title'>Navigator Focus</div>

                        <input type="radio" id='all-navigators' name='navigator-grouping' defaultChecked={navigatorGroupingState === NavigatorGrouping.All} onClick={() => { updateNavigatorGrouping(NavigatorGrouping.All) }}></input>
                        <label htmlFor='all-navigators'>All Navigators</label><br></br>
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

                    <div className='listViewer bottom'>
                        <div className='title'>Data Focus</div>

                        <input type="radio" id='week' name='date' defaultChecked={dateGroupingState === DateGrouping.Week} onClick={() => { updateDateGrouping(DateGrouping.Week) }}></input>
                        <label htmlFor='week'>Past 7 days</label><br></br>
                        <input type="radio" id='day' name='date' defaultChecked={dateGroupingState === DateGrouping.Day} onClick={() => { updateDateGrouping(DateGrouping.Day) }}></input>
                        <label htmlFor='day'>One day: </label>
                        <input type="date" id="data-date" defaultValue={dateState} onChange={(e) => { updateDate(e.target.value) }}></input>
                        <div style={{ height: "10px"}}></div>

                        <select id="data-focus" name="Query Types" defaultValue={dataFocusState} onChange={(e) => { updateDataFocus(e.target.value) }}>
                            <option value={dataFocusTypes.titleday}>Administration total of each selected survey over the past week</option>
                            <option value={dataFocusTypes.perday}>Administration total of all surveys over the past week</option>
                            <option value={dataFocusTypes.titles}>Total administration of all surveys</option>
                        </select>
                        <p style={{ fontWeight: "bold" }}>Available Surveys:</p>
                        <div className='surveyList listViewer'>
                            <div className='listElements'>
                            {surveys.length > 0 ?
                                surveys.map((survey, ind) => {
                                    return <div key={ind}>
                                            <input type='checkbox' id={survey.title} value={survey.title} defaultChecked={selectedSurveysCheckState.has(survey.title)} onChange={(e) => { handleClick(survey.title, e.target.checked) }}></input>
                                            <label htmlFor={survey.title}>{survey.title}</label>
                                        </div>
                                })
                                : <div>There are no survey templates at the moment</div>
                            }
                            </div>
                        </div>
                        <p style={{ color: "red" }}>*Select a maximum of 5 survey titles.</p>
                    </div>
                </div>

                <div className='middleColumn right'>
                    <div className='listViewer top'>
                        <div className='title'>Chart Type</div>
                        <select id="chart-types" defaultValue={chartTypeNameState} name="Chart Types" onChange={(e) => {updateChartType(e.target.value)}}>
                            <option value='Pie' defaultChecked>Pie</option>
                            <option value='Combo'>Combo</option>
                            <option value='Line'>Line</option>
                            <option value='Bar'>Bar</option>
                        </select>
                        <p style={{ color: "green", fontWeight: "bold" }}>Valid Data Focuses:</p>
                        <p id='valid-focuses' style={{ whiteSpace: "pre-wrap"}}>{validDataFocusesState}</p>
                        <div className='generateBox center'>
                            <button className='generate-button' onClick={generateChart}>Generate</button>
                            <p id="popup-title" className='popup popupTitle center'>{popupTitleState}</p>
                            <p id="popup-message" className='popup center'>{popupMessageState}</p>
                        </div>
                    </div>
                    <div className='listViewer bottom'>
                        <div className='title'>Your Chart!</div>
                        <div className='chartContainer' id="chart"></div>
                    </div>
                </div>
            </div>
    </div>
    )
}


export default Analytics;
