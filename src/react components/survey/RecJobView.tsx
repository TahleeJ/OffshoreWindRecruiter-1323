import React from 'react';
import { RecommendedJobWithData } from '../../firebase/Types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';


interface props {
    jobs: RecommendedJobWithData[];
}

const RecJobView: React.FC<props> = props => {
    const printRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;
    const downloadPDF = async () => {
        const element = printRef.current;
        const canvas = await html2canvas(element);
        const data = canvas.toDataURL('image/png');
    
        const pdf = new jsPDF();
        const imgProperties = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight =
          (imgProperties.height * pdfWidth) / imgProperties.width;
          
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        let offshoreinfo = ["4JK90mg", "2kJt9wm", "jRSqd5K", "wMk5pKS", "z5CtFZ1", "26MRXFy", "R3HmWXf"]

        for (var i = 0; i < offshoreinfo.length; i++) {
            pdf.addPage();
            var img = document.createElement('img');
            img.src = "https://i.ibb.co/" + offshoreinfo[i] + "/OWI-Recruiter.jpg";
            if (offshoreinfo[i] == "R3HmWXf") {
                pdf.addImage(img, 'JPEG', 0, 0, 203, 320);
            } else {
                pdf.addImage(img, 'JPEG', 0, 0, 203, 393);
            }
        }
    
        pdf.save('Offshore Wind Recommended Jobs.pdf');
    }
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
                            {/* <div className='jobLink'>{recommendation.jobOpp.jobLink}</div>
                        <div className='labels'>
                            {recommendation.jobOpp.labelIds.map((l, i) => (
                                <span key={i}>-{labels.find(searchLabel => searchLabel.id === l)?.name}- </span>
                            ))
                            }
                        </div> */}
                        </div>
                    ))}
            </div>
        </>
    );
};

export default RecJobView;
