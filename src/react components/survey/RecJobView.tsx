import React, {Component} from 'react';
import { RecommendedJobWithData } from '../../firebase/Types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import $ from 'jquery';


interface props {
    jobs: RecommendedJobWithData[];
}
let first = false;

const RecJobView: React.FC<props> = props => {
    var doc = new jsPDF();
    return (
        <>
            <button onClick={() => { 
                if (!first) {
                    first = true;
                    getPDF();
                }
            }}>Download Results</button>
            {/* <span>Here are some job recommendations that align with your survey answers:</span> */}
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
        </>
    );
};

export default RecJobView;

  function getPDF(){

    var HTML_Width = $(".printThis").width()!;
    var HTML_Height = $(".printThis").height()!;
    var top_left_margin = 15;
    var PDF_Width = HTML_Width+(top_left_margin*2);
    var PDF_Height = (PDF_Width*1.5)+(top_left_margin*2);
    var canvas_image_width = HTML_Width;
    var canvas_image_height = HTML_Height;
    
    var totalPDFPages = Math.ceil(HTML_Height/PDF_Height)-1;
    

    html2canvas($(".printThis")[0],{allowTaint:true}).then(function(canvas) {
        canvas.getContext('2d');
        
        console.log(canvas.height+"  "+canvas.width);
        
        
        var imgData = canvas.toDataURL("image/jpeg", 1.0);
        var pdf = new jsPDF('p', 'pt',  [PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin,canvas_image_width,canvas_image_height);
        
        
        for (var i = 1; i <= totalPDFPages; i++) { 
            pdf.addPage([PDF_Width, PDF_Height]);
            pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height*i)+(top_left_margin*4),canvas_image_width,canvas_image_height);
        }
        
        pdf.save("HTML-Document.pdf");
    });
};
