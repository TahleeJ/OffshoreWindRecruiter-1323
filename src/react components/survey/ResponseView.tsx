import React from 'react';
import { JobOpp, ComponentType, RecommendedJobWithData, AdministeredSurveyResponse } from '../../firebase/Types';
import { useAppSelector } from '../../redux/hooks';
import RecJobView from './RecJobView';


const ResponseView: React.FC = () => {
    const response = useAppSelector(s => s.navigation.operationData as AdministeredSurveyResponse);
    const jobOpps = useAppSelector(s => s.data.jobOpps);
    const qs = useAppSelector(s => s.data.surveys);
    const jobs = (): RecommendedJobWithData[] => {
        if (!response.recommendedJobs) return [];

        return response.recommendedJobs.map(rj => {
            return {
                score: rj.score,
                jobOpp: jobOpps.find(j => j.id === rj.jobOppId) as JobOpp
            };
        }).sort((a, b) => b.score - a.score);
    };
    const survey = qs.find(s => s.id === response.surveyId);

    return (
        <div className='ResponseView container'>
            <div className='section'>
                <div className='title'>Recommendations:</div>
                <RecJobView jobs={jobs()} />
            </div>
            <div className='section'>
                <div className='title'>Response:</div>
                {
                    survey?.components.map((q, i) => (
                        <>
                            <div className='question'>{q.prompt}</div>
                            <div>{q.componentType === ComponentType.MultipleChoice
                                ? q.answers[response.answers[i] as number]?.text
                                : response.answers[i]
                            }</div>
                        </>
                    ))
                }
            </div>
        </div>
    );
};

export default ResponseView;
