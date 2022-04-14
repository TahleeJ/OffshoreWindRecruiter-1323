import React from 'react';


const InfoPage: React.FC = () => {
    return (
        <div id='InfoPage'>
            <div className='container'>
                <div className='inner'>
                    <div className="fa fa-users"> JOB OPPORTUNITY</div>
                    <div className='text'>A job listing that administrators can add to find potential workers.</div>
                </div>
                <div className='inner'>
                    <div className="fa fa-file-text"> SURVEY</div>
                    <div className='text'>A list of questions to be completed by potential workers to match jobs.</div>
                </div>
                <div className='inner'>
                    <div className="fa fa-tag"> LABEL</div>
                    <div className='text'>A category that describes a job opportunity and can be linked to survey questions. 
                        “Technician” could be a label for jobs involving hands on work or involves repairing machines.
                        It is used to provide recommended job opportunities to survey responders</div>
                </div>
            </div>
        </div>
    )
}

export default InfoPage