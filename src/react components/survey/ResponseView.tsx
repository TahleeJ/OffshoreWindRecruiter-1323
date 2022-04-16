import React from 'react';
import { JobOpp, ComponentType, RecommendedJobWithData, StoredSurveyResponse } from '../../firebase/Types';
import { useAppSelector } from '../../redux/hooks';
import Section from '../generic/Section';
import RecJobView from './RecJobView';


const ResponseView: React.FC = () => {
    const response = useAppSelector(s => s.navigation.operationData as StoredSurveyResponse);
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
    if (survey === undefined) {
        return (
            <div className='ResponseView container'>
                <div className='section'>
                    <div className='title'>Recommendations:</div>
                    <RecJobView jobs={jobs()} />
                </div>
                <div className='title'>The survey taken with this response has been deleted. </div>
            </div>
        );
    }


    // Maps component hash to answer
    const answerMap = new Map<number, (number | string)>();
    response.components.forEach(a => answerMap.set(a.componentHash, a.answer));
    const answers = survey.components.map(q => answerMap.get(q.hash));

    // Number of components without an answer in the stored response
    const addedComponents = survey.components.reduce((prev, curr) => prev + (answerMap.has(curr.hash) ? 0 : 1), 0);
    // Number of answers without a component in the survey
    const removedComponents = answerMap.size + addedComponents - survey.components.length;

    return (
        <div className='ResponseView container'>
            <Section title='Recommendations:'>
                <RecJobView jobs={jobs()} />
            </Section>
            <Section title='Response:'>
                { removedComponents > 0
                    ? <div className='question'>
                        <span>Since the survey was taken, </span>
                        {removedComponents === 1 ? '1 component has' : removedComponents + ' component have'} been removed.
                    </div>
                    : null
                }
                {
                    survey.components.map((c, i) =>
                        answerMap.has(c.hash)
                            ? (
                                <React.Fragment key={i}>
                                    <div className='question'>{c.prompt}</div>
                                    <div>{c.componentType === ComponentType.MultipleChoice
                                        ? c.answers[answers[i] as number]?.text
                                        : answers[i]
                                    }</div>
                                </React.Fragment>
                            )
                            : <div className='question'>This component was added after this response was taken. </div>
                    )
                }
            </Section>
        </div>
    );
};

export default ResponseView;
