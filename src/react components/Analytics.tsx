import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { DataQuery } from '../firebase/Analytics/Analytics';
import { Chart, drawChart } from '../firebase/Analytics/Draw';

/** The props (arguments) to create this element */
interface props {

}

enum NavigatorGrouping {
    All = 0,
    Set = 1,
    None = 3
}

const dataFocusTypes = {
    titleday: "TitleDay",
    perday: "PerDay",
    titles: "Titles"
};

const validQueryCharts = {
    pie: [DataQuery.AllTitles, DataQuery.OneTitles],
    combo: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay],
    line: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay, DataQuery.AllPerDay, DataQuery.OnePerDay],
    bar: [DataQuery.AllTitles, DataQuery.OneTitles, DataQuery.AllPerDay, DataQuery.OnePerDay]
}

const Analytics: React.FC = (props) => {
    const surveys = useAppSelector(s => s.data.surveys);

    var popupVisible = false;
    var popupTitle = "";
    var popupMessage = "";
    var queryType = DataQuery.AllTitles;
    var navigatorGrouping = NavigatorGrouping.All;
    var dataFocus = dataFocusTypes.titles;
    var chartType = Chart.Pie;


    const togglePopup = () => {
        title!.innerHTML = popupTitle;
        message!.innerHTML = popupMessage;

    };

    const resetPopup = () => {
        popupTitle = "";
        popupMessage = "";

        togglePopup();
    }

    const dispatch = useAppDispatch();
    const maxSelectedSurveys = 5;
    var selectedSurveyCount = 0;
    var selectedSurveys: string[] = [];
    var selectedNavigators: string[] = [];

    const dataFocusSelector = document.getElementById("data-focus") as HTMLInputElement;
    const chartTypeSelector = document.getElementById("chart-types") as HTMLInputElement;
    const navigatorBox = document.getElementById("navigator-emails") as HTMLInputElement;
    const title = document.getElementById("popup-title");
    const message = document.getElementById("popup-message");

    google.charts.load("current", {packages:["corechart"]});

    /*
        Pie-> AllTitles, OneTitles
        Combo -> AllTitlesPerDay, OneTitlesPerDay
        Line -> AllPerDay, OnePerDay, AllTitlesPerDay, OneTitlesPerDay
        Bar -> AllTitles, OneTitles, AllPerDay, OnePerDay
    */

    function getChartType(value: string) {
        switch(value) {
            case 'Pie':
                chartType = Chart.Pie;
                break;
            case 'Combo':
                chartType = Chart.Combo;
                break;
            case 'Line':
                chartType = Chart.Line;
                break;
            case 'Bar':
                chartType = Chart.Bar;
                break;
            default:
                break;
        }
    }

    function validateChartType(): boolean {
        var validChartType: boolean;

        switch(chartType!) {
            case Chart.Pie:
                validChartType = validQueryCharts.pie.includes(queryType);
                break;
            case Chart.Combo:
                validChartType = validQueryCharts.combo.includes(queryType);
                break;
            case Chart.Line:
                validChartType = validQueryCharts.line.includes(queryType);
                break;
            case Chart.Bar:
                validChartType = validQueryCharts.bar.includes(queryType);
                break;
            default:
                break;
        }

        return validChartType!;
    }

    function validateNavigatorEntry(): boolean {
        const navigators: string[] = navigatorBox.value.split(",");
        
        if (navigators.length > 5) {
            return false;
        } else {
            selectedNavigators = navigators;

            return true;
        }
    }

    function determineQueryType() {
        dataFocus = dataFocusSelector.value;

        switch(navigatorGrouping) {
            case NavigatorGrouping.All:
                switch(dataFocus) {
                    case dataFocusTypes.titleday:
                        queryType = DataQuery.AllTitlesPerDay;
                        break;
                    case dataFocusTypes.perday:
                        queryType = DataQuery.AllPerDay;
                        break;
                    case dataFocusTypes.titles:
                        queryType = DataQuery.AllTitles;
                        break;
                    default:
                        break;
                }
                break;
            case NavigatorGrouping.Set:
                switch(dataFocus) {
                    case dataFocusTypes.titleday:
                        queryType = DataQuery.OneTitlesPerDay;
                        break;
                    case dataFocusTypes.perday:
                        queryType = DataQuery.OnePerDay;
                        break;
                    case dataFocusTypes.titles:
                        queryType = DataQuery.OneTitles;
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    const generateChart = async() => {
        determineQueryType();

        const validChartType = validateChartType();

        if (navigatorGrouping === NavigatorGrouping.Set) {
            const validNavigatorEntry = validateNavigatorEntry();

            if (!validNavigatorEntry) {
                popupTitle = "Invalid Navigator Email Entry";
                popupMessage = "Please enter at least one email and separate more by commas.";
                togglePopup();
            } else {
                if (validChartType!) {
                    if (dataFocus == dataFocusTypes.titleday && selectedSurveys.length == 0) {
                        popupTitle = "Empty Survey Selection";
                        popupMessage = "Please select at least one survey you would like to see data for.";
                        togglePopup();
                    } else {
                        resetPopup();
                        await drawChart(selectedSurveys, selectedNavigators, chartType, queryType);
                    }
                } else {
                    popupTitle = "Invalid Chart Type";
                    popupMessage = `Chart type *${chartTypeSelector!.value}* is incompatible with your selected query.`;
                    togglePopup();
                }
            }
        } else {
            if (validChartType!) {
                if (dataFocus == dataFocusTypes.titleday && selectedSurveys.length == 0) {
                    popupTitle = "Empty Survey Selection";
                    popupMessage = "Please select at least one survey you would like to see data for.";
                    togglePopup();
                } else {
                    resetPopup();
                    await drawChart(selectedSurveys, selectedNavigators, chartType, queryType);
                }
            } else {
                console.log(queryType);
                popupTitle = "Invalid Chart Type";
                popupMessage = `Chart type *${chartTypeSelector!.value}* is incompatible with your selected query.`;
                togglePopup();
            }
        }   
    }

    function handleClick(id: string) {
        const checkbox = document.getElementById(id) as HTMLInputElement;
        const surveyName = checkbox.value;
        var check = false;

            if (checkbox.checked) {
                if (selectedSurveyCount < maxSelectedSurveys) {
                    check = true;
                    checkbox.checked = true;
    
                    selectedSurveys.push(surveyName);
                    selectedSurveyCount++;
                } else {
                    check = false;
                    checkbox.checked = false;
                }
            } else {
                selectedSurveyCount--;

                const removeIndex = selectedSurveys.indexOf(surveyName);
                selectedSurveys.splice(removeIndex, 1);
            }
        
        return check;
    }

    return (
        <div id='analytics' className='adminContainer'>
            <div className='topGrid'>  
                <div className='config'>  
                    <h3>Query Configuration:</h3> 
                    <div className='listViewer' style={{ textAlign: "left" }}>
                        <p>Navigator Group:</p>
                        <input type="radio" id='all-navigators' name='navigator-grouping' defaultChecked onClick={() => { navigatorGrouping = NavigatorGrouping.All}}></input>
                        <label htmlFor='all-navigators'>All Navigators</label><br></br>
                        <input type="radio" id='set-navigators' name='navigator-grouping' onClick={() => { navigatorGrouping = NavigatorGrouping.Set}}></input>
                        <label htmlFor='set-navigators'>One Navigator/Set of Navigators</label>

                        <p>Data Focus:</p>
                        <select id="data-focus" name="Query Types" defaultValue={dataFocusTypes.titles}>
                            <option value={dataFocusTypes.titleday}>Administration total of each selected survey over the past week</option>
                            <option value={dataFocusTypes.perday}>Administration total of all surveys over the past week</option>
                            <option value={dataFocusTypes.titles}>Total administration of all surveys</option>
                        </select>   
                        {/* <p>Distribution of...</p>
                        <input type='radio' id='all-title-day' name='query-type' onClick={() => setQueryType(DataQuery.AllTitlesPerDay)}></input>
                        <label htmlFor="all-title-day">Each survey across all days in range for all navigators</label><br></br>
                        <input type='radio' id='all-day' name='query-type' onClick={() => setQueryType(DataQuery.AllPerDay)}></input>
                        <label htmlFor='all-day'>Total surveys across all days in range for all navigators</label><br></br>
                        <input type='radio' id='all-title' name='query-type' onClick={() => setQueryType(DataQuery.AllTitles)}></input>
                        <label htmlFor="all-title">Each survey title total for all navigators</label><br></br>
                        <div style={{ height: "10px"}}></div>

                        <input type='radio' id='each-title-day' name='query-type' onSelect={() => setQueryType(DataQuery.EachTitlesPerDay)}></input>
                        <label htmlFor='each-title-day'>Each survey across all days in range for each navigator</label><br></br>
                        <input type='radio' id='each-day' name='query-type' onSelect={() => setQueryType(DataQuery.EachPerDay)}></input>
                        <label htmlFor='each-day'>Total surveys across all days in range for each navigator</label><br></br>
                        <input type='radio' id='each-title' name='query-type' onSelect={() => setQueryType(DataQuery.EachTitles)}></input>
                        <label htmlFor='each-title'>Each survey title total for each navigator</label><br></br>
                        <div style={{ height: "10px"}}></div>

                        <input type='radio' id='one-title-day' name='query-type' onSelect={() => setQueryType(DataQuery.OneTitlesPerDay)}></input>
                        <label htmlFor='one-title-day'>Each survey across all days in range for desired navigator</label><br></br>
                        <input type='radio' id='one-day' name='query-type' onSelect={() => setQueryType(DataQuery.OnePerDay)}></input>
                        <label htmlFor='one-day'>Total surveys across all days in range for desired navigator</label><br></br>
                        <input type='radio' id='one-title' name='query-type' onSelect={() => setQueryType(DataQuery.OneTitles)}></input>
                        <label htmlFor='one-title'>Each survey title total for desired navigator</label><br></br> */}
                    </div>

                    <div style={{ height: "25px"}}></div>
                    <h3>Available Surveys:</h3>
                    <div className='listViewer' style={{ height: "200px", overflow: "auto", textAlign: "left" }}>
                        {surveys.length > 0 ?
                            surveys.map((survey, ind) => {
                                return <div>
                                        <input type='checkbox' id={":" + ind} value={survey.title} onClick={() => handleClick(":" + ind)}></input>
                                        <label htmlFor={":" + ind}>{survey.title}</label>
                                    </div>
                            })
                            : <div>There are no survey templates at the moment</div>
                        }
                    </div>
                    <p style={{ color: "red" }}>*Select a maximum of 5 survey titles.</p>
                    <div style={{ height: "10px"}}></div>
                    <h3>Specific Navigators:</h3>
                    
                    <div>
                        <label htmlFor='navigator-emails'>Specific navigator(s):</label>
                        <input type='text' id='navigator-emails'></input>
                        <label htmlFor='navigator-emails'>* Separate by commas if more than one</label>
                        <p style={{ color: "red" }}>*Enter a maximum of 5 emails.</p>
                        {/* <br></br> */}
                        {/* <div style={{ height: "10px"}}></div> */}
                        {/* <label htmlFor='start-date'>Start date:</label>
                        <input type='date' id='start-date' onChange={(e) => setStartDate(e.target.value)}></input>
                        <label htmlFor='start-date'>End date:</label>
                        <input type='date' id='end-date' onChange={(e) => setEndDate(e.target.value)}></input> */}
                    </div>
                    <div style={{ height: "10px"}}></div>
                    <h3>Chart Type:</h3>
                    <select id="chart-types" name="Chart Types" onChange={(e) => {getChartType(e.target.value)}}>
                        <option value='Pie' defaultChecked>Pie</option>
                        <option value='Combo'>Combo</option>
                        <option value='Line'>Line</option>
                        <option value='Bar'>Bar</option>
                    </select>
                    <br></br>

                    <div style={{ height: "10px"}}></div>

                     <button onClick={generateChart}>Generate</button>
                </div>
                <div id='Popup-analytics' style={{ display: "hidden" }}>
                    <div>
                        <div>
                            <h4 id="popup-title" style={{ color: "red" }}></h4>
                            <p id="popup-message" style={{ color: "red" }}></p>
                        </div>
                    </div>
                </div>
                <div className='chartContainer'>
                    <div className='' id="chart" style={{height: "600px", width: "900px", overflow: "auto"}}></div>
                </div>
            </div>
        </div>
    )
}


export default Analytics;
