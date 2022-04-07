import { useAppSelector } from '../redux/hooks';
import { DataQuery } from '../firebase/Analytics/Analytics';
import { Chart, drawChart } from '../firebase/Analytics/Draw';
import { authInstance } from '../firebase/Firebase';

enum NavigatorGrouping {
    All = 0,
    Set = 1,
    One = 2
}

const dataFocusTypes = {
    titleday: "TitleDay",
    perday: "PerDay",
    titles: "Titles"
};

const validQueryCharts = {
    pie: {
        list: [DataQuery.AllTitles, DataQuery.OneTitles, DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay], // EachTitles
        text: "Total administration of all surveys<br />Administration total of each selected survey over the past week"
    }, 
    combo: {
        list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay],
        text: "Administration total of each selected survey over the past week"
    },
    line: {
        list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay, DataQuery.AllPerDay, DataQuery.OnePerDay],
        text: "Administration total of each selected survey over the past week<br />Administration total of all surveys over the past week"
    },
    bar: {
        list: [DataQuery.AllTitlesPerDay, DataQuery.OneTitlesPerDay, DataQuery.AllTitles, DataQuery.OneTitles, DataQuery.AllPerDay, DataQuery.OnePerDay], // EachTitles, EachPerDay
        text: 'Administration total of each selected survey over the past week<br />Administration total of all surveys over the past week<br />Total administration of all surveys'
    }
}

const Analytics: React.FC = (props) => {
    const surveys = useAppSelector(s => s.data.surveys);
    const userEmail = authInstance.currentUser!.email!;

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

    const maxSelectedSurveys = 5;
    var selectedSurveyCount = 0;
    var selectedSurveys: string[] = [];
    var selectedNavigators: string[] = [];

    const dataFocusSelector = document.getElementById("data-focus") as HTMLInputElement;
    const chartTypeSelector = document.getElementById("chart-types") as HTMLInputElement;
    const navigatorBox = document.getElementById("navigator-emails") as HTMLInputElement;
    const chartTypeInfo = document.getElementById("valid-charts") as HTMLInputElement;
    const title = document.getElementById("popup-title");
    const message = document.getElementById("popup-message");

    google.charts.load("current", {packages:["corechart"]});

    function getChartType(value: string) {
        switch(value) {
            case 'Pie':
                chartType = Chart.Pie;
                chartTypeInfo.innerHTML = validQueryCharts.pie.text;
                break;
            case 'Combo':
                chartType = Chart.Combo;
                chartTypeInfo.innerHTML = validQueryCharts.combo.text;
                break;
            case 'Line':
                chartType = Chart.Line;
                chartTypeInfo.innerHTML = validQueryCharts.line.text;
                break;
            case 'Bar':
                chartType = Chart.Bar;
                chartTypeInfo.innerHTML = validQueryCharts.bar.text;
                break;
            default:
                break;
        }
    }

    function validateChartType(): boolean {
        var validChartType: boolean;

        switch(chartType!) {
            case Chart.Pie:
                validChartType = validQueryCharts.pie.list.includes(queryType);
                break;
            case Chart.Combo:
                validChartType = validQueryCharts.combo.list.includes(queryType);
                break;
            case Chart.Line:
                validChartType = validQueryCharts.line.list.includes(queryType);
                break;
            case Chart.Bar:
                validChartType = validQueryCharts.bar.list.includes(queryType);
                break;
            default:
                break;
        }

        return validChartType!;
    }

    function validateNavigatorEntry(): boolean {
        selectedNavigators = [];

        const navigators: string[] = navigatorBox.value.split(",");
        
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
                        queryType = DataQuery.None;
                        break;
                    case dataFocusTypes.perday:
                        queryType = DataQuery.EachPerDay;
                        break;
                    case dataFocusTypes.titles:
                        queryType = DataQuery.EachTitles;
                        break;
                    default:
                        break;
                }
                break;
            case NavigatorGrouping.One:
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
        resetPopup();
        determineQueryType();

        const validChartType = validateChartType();

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
                                await drawChart(selectedSurveys, selectedNavigators, chartType, queryType);
                            } catch (error) {
                                const { details } = JSON.parse(JSON.stringify(error));

                                popupTitle = "Query Error";
                                popupMessage = details;
                                togglePopup();
                            }
                        }
                    } else {
                        popupTitle = "Invalid Chart Type";
                        popupMessage = `Chart type *${chartTypeSelector!.value}* is incompatible with your selected data focus.`;
                        togglePopup();
                    }
                }
            } else {
                popupTitle = "Invalid Chart Type";
                popupMessage = `Chart type *${chartTypeSelector!.value}* is incompatible with your selected data focus.<br />This view is not yet available for multiple navigators!`;
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
                        await drawChart(selectedSurveys, selectedNavigators, chartType, queryType);
                    } catch (error) {
                        const { details } = JSON.parse(JSON.stringify(error));

                        popupTitle = "Query Error";
                        popupMessage = details;
                        togglePopup();
                    }
                }
            } else {
                popupTitle = "Invalid Chart Type";
                popupMessage = `Chart type *${chartTypeSelector!.value}* is incompatible with your selected data focus.`;
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
        <div id='analytics'>
            <div className='topGrid'>  
                <div className='middleColumn left' style={{ padding: "7px" }}>
                    {/* <h2></h2>  */}
                    <div className='listViewer' style={{ height: "25%"}}>
                        <div className='title'>Navigator Focus</div>
                        <input type="radio" id='all-navigators' name='navigator-grouping' defaultChecked onClick={() => { navigatorGrouping = NavigatorGrouping.All}}></input>
                        <label htmlFor='all-navigators'>All Navigators</label><br></br>
                        {/* <input type="radio" id='set-navigators' name='navigator-grouping' onClick={() => { navigatorGrouping = NavigatorGrouping.Set}}></input>
                        <label htmlFor='set-navigators'>Set of Navigators</label><br></br> */}
                        <input type="radio" id='one-navigator' name='navigator-grouping' onClick={() => { navigatorGrouping = NavigatorGrouping.One}}></input>
                        <label htmlFor='one-navigator'>One Navigator</label>
                        <div style={{ height: "10px"}}></div>
                        <div>
                            <label htmlFor='navigator-emails' style={{ fontWeight: "bold" }}>Navigator(s):</label>
                            <input className='navigatorText' type='text' id='navigator-emails' defaultValue={userEmail}></input>
                            <p style={{ color: "red" }}>*Enter a maximum of 5 emails, separate by commas if more than one.</p>
                        </div> 
                    </div>

                    <div className='listViewer' style={{ height: "75%"}}>
                        <div className='title'>Data Focus</div>
                        <select id="data-focus" name="Query Types" defaultValue={dataFocusTypes.titles}>
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
                                            <input type='checkbox' id={":" + ind} value={survey.title} onClick={() => handleClick(":" + ind)}></input>
                                            <label htmlFor={":" + ind}>{survey.title}</label>
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
                    <div className='listViewer'>
                        <div className='title'>Chart Type</div>
                        <select id="chart-types" name="Chart Types" onChange={(e) => {getChartType(e.target.value)}}>
                            <option value='Pie' defaultChecked>Pie</option>
                            <option value='Combo'>Combo</option>
                            <option value='Line'>Line</option>
                            <option value='Bar'>Bar</option>
                        </select>
                        <p style={{ color: "green", fontWeight: "bold" }}>Valid Data Focuses:</p>
                        <p id='valid-charts'>Total administration of all surveys<br />Administration total of each selected survey over the past week</p>
                        <div className='generateBox center'>
                            <button className='generate-button' onClick={generateChart}>Generate</button>
                            <p id="popup-title" className='popup popupTitle center'></p>
                            <p id="popup-message" className='popup center'></p>
                        </div>
                            

                    </div>
                    <div className='listViewer'>
                        <div className='title'>Your Chart!</div>
                        <div className='chartContainer' id="chart"></div>
                    </div>
                </div>
            </div>
    </div>
    )
}


export default Analytics;
