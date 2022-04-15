import React from 'react';
import { JobOpp, QuestionType, RecommendedJobWithData, StoredSurveyResponse } from '../../firebase/Types';
import { useAppSelector } from '../../redux/hooks';
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


    // Maps question hash to answer
    const answerMap = new Map<number, (number | string)>();
    response.answers.forEach(a => answerMap.set(a.questionHash, a.answer));
    const answers = survey.questions.map(q => answerMap.get(q.hash));

    // Number of questions without an answer in the stored response
    const addedQuestions = survey.questions.reduce((prev, curr) => prev + (answerMap.has(curr.hash) ? 0 : 1), 0);
    // Number of answers without a question in the survey
    const removedQuestions = answerMap.size + addedQuestions - survey.questions.length;

    return (
        <div className='ResponseView container'>
            <div className='section'>
                <div className='title'>Recommendations:</div>
                <RecJobView jobs={jobs()} />
            </div>
            <div className='section'>
                <div className='title'>Response:</div>
                <div className='question'>Since the survey was taken,
                    {removedQuestions === 1 ? ' 1 question has' : removedQuestions + ' questions have'} been removed. </div>
                {
                    survey.questions.map((q, i) =>
                        answerMap.has(q.hash)
                            ? (
                                <>
                                    <div className='question'>{q.prompt}</div>
                                    <div>{q.questionType === QuestionType.MultipleChoice
                                        ? q.answers[answers[i] as number]?.text
                                        : answers[i]
                                    }</div>
                                </>
                            )
                            : <div className='question'>This question was added after this response was taken. </div>
                    )
                }
            </div>
        </div>
    );
};

export default ResponseView;
