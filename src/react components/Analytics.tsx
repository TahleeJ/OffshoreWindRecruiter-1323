import React, { useState } from 'react';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changePage, PageType } from '../redux/navigationSlice';
import { DataQuery } from '../firebase/Analytics/Analytics';
import { Chart, drawChart } from '../firebase/Analytics/Draw';

/** The props (arguments) to create this element */
interface props {

}

const Analytics: React.FC = (props) => {
    const surveys = useAppSelector(s => s.data.surveys);
    const [queryType, setQueryType] = useState(DataQuery.AllTitlesPerDay);
    // const [startDate, setStartDate] = useState("");
    // const [endDate, setEndDate] = useState("");
    const dispatch = useAppDispatch();
    const maxSelectedSurveys = 5;
    var selectedSurveyCount = 0;
    var selectedSurveys: string[] = [];

    google.charts.load("current", {packages:["corechart"]});

    const generateChart = async() => {
        var chartType: Chart;

        console.log(queryType);
        // All Titles
        if (queryType in [DataQuery.AllTitles, DataQuery.OneTitles]) {
            chartType = Chart.Pie;
        } else {
            // AllPerDay
            chartType = Chart.Combo;
        }

        console.log(chartType);
        console.log(queryType);
        await drawChart(selectedSurveys, Chart.Line, DataQuery.AllPerDay);

        // resetSelected();
    }

    // function resetSelected() {
    //     for (const surveyName of selectedSurveys) {
    //         const checkbox = document.getElementById(`:${surveyName}`) as HTMLInputElement;
    //         checkbox.checked = false;

    //         selectedSurveys = [];
    //     }
    // }

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
                    <div className='listViewer' style={{ textAlign: "left" }}>
                        <p>Distribution of...</p>
                        <input type='radio' id='all-title-day' name='query-type' onSelect={() => setQueryType(DataQuery.AllTitlesPerDay)}></input>
                        <label htmlFor="all-title-day">Each survey across all days in range for all navigators</label><br></br>
                        <input type='radio' id='all-day' name='query-type' onSelect={() => setQueryType(DataQuery.AllPerDay)}></input>
                        <label htmlFor='all-day'>Total surveys across all days in range for all navigators</label><br></br>
                        <input type='radio' id='all-title' name='query-type' onSelect={() => setQueryType(DataQuery.AllTitles)}></input>
                        <label htmlFor="all-title">Each survey title total for all navigators</label><br></br>
                        <div style={{ height: "10px"}}></div>

                        {/* <input type='radio' id='each-title-day' name='query-type' onSelect={() => setQueryType(DataQuery.EachTitlesPerDay)}></input>
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

                    <div style={{ height: "10px"}}></div>

                    <div className='listViewer' style={{ textAlign: "left" }}>
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

                    <div style={{ height: "10px"}}></div>
                    <div>
                        <label htmlFor='navigator-email'>Specific navigator:</label>
                        <input type='text' id='navigator-email'></input>
                        <br></br>
                        <div style={{ height: "10px"}}></div>
                        {/* <label htmlFor='start-date'>Start date:</label>
                        <input type='date' id='start-date' onChange={(e) => setStartDate(e.target.value)}></input>
                        <label htmlFor='start-date'>End date:</label>
                        <input type='date' id='end-date' onChange={(e) => setEndDate(e.target.value)}></input> */}
                    </div>

                     <button onClick={generateChart}>Generate</button>
                </div>
                <div className='chartContainer'>
                    <div className='' id="chart" style={{height: "600px", width: "900px", overflow: "auto"}}></div>
                </div>
            </div>
        </div>
    )
}


export default Analytics;
