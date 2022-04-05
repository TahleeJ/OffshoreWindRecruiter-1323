import React from 'react';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { changePage, PageType, Status } from '../redux/navigationSlice';
import { DataQuery } from '../firebase/Analytics/Analytics';
import { Chart, drawChart } from '../firebase/Analytics/Draw';

/** The props (arguments) to create this element */
interface props {

}

const Analytics: React.FC = (props) => {
    const status = useAppSelector(s => s.navigation.status);
    const dispatch = useAppDispatch();

    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawChart);

    const generateChart = async() => {
        await drawChart(Chart.Pie, DataQuery.AllTitles);
    }

    return (
        <div className='administerSurveyPage container'>
            <button className="red" onClick={() => dispatch(changePage({ type: PageType.Home }))}>Return to Home</button>

            {/* { status === Status.fulfilled &&
                <> */}
                    <div className='' id="chart"></div>
                {/* </>
            }
            {status === Status.pending &&
                <>
                    Loading Chart:
                    <i className="fa-solid fa-spinner fa-spin-pulse loadIcon"></i>
                </>
            } */}

            <button onClick={generateChart}>Generate</button>
        </div>
    )
}


export default Analytics;
