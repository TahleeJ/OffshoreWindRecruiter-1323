import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { RecommendedJobWithData } from '../../firebase/Types';
import OffShoreInfo from '../OffshoreInfo';


interface props {
    jobs: RecommendedJobWithData[];
}

const RecJobView: React.FC<props> = props => {
    const [printing, setPrinting] = useState(false);

    const printRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;
    const printRef2 = React.useRef() as React.MutableRefObject<HTMLInputElement>;

    const downloadPDF = async () => {
        setPrinting(true);

        // Fix bug with html2canvas not rendering shadows correctly
        const recommendations = document.querySelectorAll('.recommendation') as NodeListOf<HTMLElement>;
        const oldShadow = recommendations[0].style.boxShadow;
        recommendations.forEach(r => { r.style.boxShadow = 'none'; });

        const element = printRef.current;
        const canvas = await html2canvas(printRef.current);
        const data = canvas.toDataURL('image/png', 1);

        const margin = 20;
        const pdf = new jsPDF('p', 'pt', 'letter');
        const imgProperties = pdf.getImageProperties(data);
        const pWidth = pdf.internal.pageSize.width;
        const srcWidth = element.scrollWidth;
        const scale = (pWidth - margin * 2) / srcWidth;

        pdf.addImage(data, 'png', margin, margin, imgProperties.width * scale, imgProperties.height * scale);
        pdf.html(printRef2.current, {
            callback: function (doc) {
                doc.save('Offshore Wind Recommended Jobs.pdf');

                setPrinting(false);
            },
            margin: [margin, margin, margin, margin],
            html2canvas: {
                scale: scale
            },
            y: pdf.internal.pageSize.height,
            autoPaging: 'text'
        });

        recommendations.forEach(r => { r.style.boxShadow = oldShadow; });
    };

    return (
        <>
            <button type="button" onClick={downloadPDF}>Download Results</button>
            {/* <span>Here are some job recommendations that align with your survey answers:</span> */}
            <div ref={printRef}>
                {props.jobs.length === 0
                    ? <span>No jobs are paired with the labels used in this survey.</span>
                    : props.jobs.map((recommendation, index) => (
                        <div id="jobRec" key={index} className={'recommendation ' + ((recommendation.score > 0) ? 'positive' : (recommendation.score >= -0.5) ? 'neutral' : 'negative')}>
                            <div className="jobRecContainer">
                                {recommendation.jobOpp
                                    ? <>
                                        <div className='title'>{recommendation.jobOpp.jobName}</div>
                                        <div className='compName'>{recommendation.jobOpp.companyName}</div>
                                        <div className='jobDesc'>{recommendation.jobOpp.jobDescription}</div>
                                    </>
                                    : <div>Job no longer exists</div>
                                }
                            </div>
                            <div className="divider"></div>
                            <div className="recContainer">
                                {recommendation.score > 0
                                    ? <span className="check">
                                        <div><i className="fas fa-check"></i></div>
                                        {recommendation.score >= 0.5 ? 'highly' : ''} recommend
                                    </span>
                                    : <span className="x">
                                        <div><i className="fas fa-times"></i></div>
                                        {recommendation.score <= -0.5 ? 'highly' : ''} not recommend
                                    </span>
                                }
                            </div>
                        </div>
                    ))}
            </div>
            {printing
                ? <div ref={printRef2}>
                    <OffShoreInfo />
                </div>
                : null
            }
        </>
    );
};

export default RecJobView;
