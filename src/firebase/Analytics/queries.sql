/*
    *****WARNING*****

    Editing this file will NOT change the available queries. This file
    is purely for reference.

    To edit the available queries for BigQuery, please visit this site:
    https://console.cloud.google.com/bigquery?project=hallowed-digit-338620

    It is highly recommended to edit queries at the link above as that will
    provide the quickest method of testing.

    This particular query file can be found here: 
    https://console.cloud.google.com/bigquery?sq=533164020983:4a7e31672a174edfa892a313a8a443e5
*/

/*

    *****SURVEY QUERIES*****

*/
-- The total administration of each survey titles for each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_all_title_day(forDay BOOLEAN, startDate STRING) AS
SELECT event_date, survey_title, COUNT(survey_title) AS frequency
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
GROUP BY event_date, survey_title
ORDER BY event_date DESC, LOWER(survey_title) ASC;

-- The total administration of all surveys for each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_all_day(forDay BOOLEAN, startDate STRING) AS
SELECT event_date, COUNT(survey_title) AS frequency
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date, 
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
GROUP BY event_date
ORDER BY event_date DESC;

-- The total administration of all surveys since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_all_titles(forDay BOOLEAN, startDate STRING) AS
SELECT survey_title, COUNT(survey_title) AS frequency
FROM (
    (SELECT   
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT   
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
GROUP BY survey_title
ORDER BY LOWER(survey_title) ASC
LIMIT 365;

-- The total administration of each survey titles for each day for each navigator since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_each_title_day(forDay BOOLEAN, startDate STRING) AS
SELECT event_date, survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
GROUP BY event_date, survey_title, navigator
ORDER BY event_date DESC, LOWER(survey_title) ASC;

-- The total administration of all surveys for each day for each navigator since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_each_day(forDay BOOLEAN, startDate STRING) AS
SELECT event_date, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
GROUP BY event_date, navigator
ORDER BY event_date DESC;

-- The total administration of all surveys for each navigator since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_each_titles(forDay BOOLEAN, startDate STRING) AS
SELECT survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
GROUP BY survey_title, navigator
ORDER BY LOWER(survey_title) ASC
LIMIT 365;

-- The total administration of each survey for one navigator for each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_navigator_title_day(name STRING, forDay BOOLEAN, startDate STRING) AS
SELECT event_date, survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
GROUP BY event_date, survey_title, navigator
ORDER BY event_date DESC, LOWER(survey_title) ASC;

-- The total administration for all surveys for one navigator for each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_navigator_day(name STRING, forDay BOOLEAN, startDate STRING) AS
SELECT event_date, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
GROUP BY event_date, navigator
ORDER BY event_date ASC;

-- The total administration of all surveys for one navigator since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_navigator_titles(name STRING, forDay BOOLEAN, startDate STRING) AS
SELECT survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE navigator = name
GROUP BY survey_title, navigator
ORDER BY LOWER(survey_title) ASC
LIMIT 365;

/*

    *****JOB QUERIES*****

*/
-- The total number of matches for a job for each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_total_job(jobName STRING, forDay BOOLEAN, startDate STRING) AS
SELECT event_date, job_title, COUNT(job_title) AS frequency
FROM (
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title" AND value.string_value = jobName) AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title" AND value.string_value = jobName) AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE job_title IS NOT NULL
GROUP BY event_date, job_title
ORDER BY event_date DESC, LOWER(job_title) ASC;

-- The average matching score for a job for each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_average_job(jobName STRING, forDay BOOLEAN, startDate STRING) AS
SELECT event_date, job_title, AVG(score) AS average_score 
FROM (
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title" AND value.string_value = jobName) AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title" AND value.string_value = jobName) AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE job_title IS NOT NULL
GROUP BY job_title, event_date
ORDER BY event_date DESC, LOWER(job_title) ASC;

-- The 10 jobs with the highest average matching score since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_highest_average_job(forday BOOLEAN, startDate STRING) AS
SELECT job_title, AVG(score) AS average_score 
FROM (
    (SELECT
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title") AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT 
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title") AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE job_title IS NOT NULL
GROUP BY job_title
ORDER BY average_score DESC;

-- The 10 jobs with the lowest average matching score since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_lowest_average_job(forday BOOLEAN, startDate STRING) AS
SELECT job_title, AVG(score) AS average_score 
FROM (
    (SELECT
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title") AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT 
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title") AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE job_title IS NOT NULL
GROUP BY job_title
ORDER BY average_score ASC;

-- The average matching score for each survey for each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_average_survey(forday BOOLEAN, startDate STRING) AS
SELECT event_date, survey_title, AVG(score) AS average_score 
FROM (
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "administered_survey_title") AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE survey_title IS NOT NULL
GROUP BY event_date, survey_title
ORDER BY event_date DESC, LOWER(survey_title) ASC;

-- The total number of positive matching scores for a job each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_positive_job(jobName STRING, forday BOOLEAN, startDate STRING) AS
SELECT event_date, job_title, COUNT(score) AS frequency 
FROM (
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title" AND value.string_value = jobName) AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title" AND value.string_value = jobName) AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE job_title IS NOT NULL AND score > 0
GROUP BY job_title, event_date
ORDER BY event_date DESC, LOWER(job_title) ASC;

-- The total number of negative matching scores for a job each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_negative_job(jobName STRING, forday BOOLEAN, startDate STRING) AS
SELECT event_date, job_title, COUNT(score) AS frequency 
FROM (
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title" AND value.string_value = jobName) AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "job_title" AND value.string_value = jobName) AS job_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE job_title IS NOT NULL AND score < 0
GROUP BY job_title, event_date
ORDER BY event_date DESC, LOWER(job_title) ASC;

-- The total number of positive matching scores for a survey each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_positive_survey(surveyName STRING, forday BOOLEAN, startDate STRING) AS
SELECT event_date, survey_title, COUNT(score) AS frequency 
FROM (
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "administered_survey_title" AND value.string_value = surveyName) AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "administered_survey_title" AND value.string_value = surveyName) AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE survey_title IS NOT NULL AND score > 0
GROUP BY survey_title, event_date
ORDER BY event_date DESC, LOWER(survey_title) ASC;

-- The total number of negative matching scores for a survey each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_negative_survey(surveyName STRING, forday BOOLEAN, startDate STRING) AS
SELECT event_date, survey_title, COUNT(score) AS frequency 
FROM (
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "administered_survey_title" AND value.string_value = surveyName) AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "matched_score") AS score,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "administered_survey_title" AND value.string_value = surveyName) AS survey_title
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "job_matched" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE survey_title IS NOT NULL AND score < 0
GROUP BY survey_title, event_date
ORDER BY event_date DESC, LOWER(survey_title) ASC;

/*

    *****LABEL QUERIES*****

*/
-- Each linear/percentile matching score pairing for a label since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_all_label(labelName STRING, forDay BOOLEAN, startDate STRING) AS
SELECT label_title, COUNT(label_title) as frequency, linear_score, percentile_score
FROM (
    (SELECT
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "label_title" AND value.string_value = labelName) AS label_title,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "linear_score") AS linear_score,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "percentile_score") AS percentile_score
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "label_used" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "label_title" AND value.string_value = labelName) AS label_title,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, value.int_value) FROM UNNEST(event_params)
            WHERE key = "linear_score") AS linear_score,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "percentile_score") AS percentile_score
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "label_used" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE label_title IS NOT NULL
GROUP BY label_title, linear_score, percentile_score
ORDER BY LOWER(label_title) ASC, frequency DESC
LIMIT 100;

-- The total number of usages and average linear and percentile matching scores for a label each day since the start date
CREATE OR REPLACE TABLE FUNCTION analytics_313603226.get_average_label(labelName STRING, forDay BOOLEAN, startDate STRING) AS
SELECT event_date, label_title, COUNT(label_title) AS frequency, AVG(linear_score) AS average_linear, AVG(percentile_score) AS average_percentile
FROM (
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "label_title" AND value.string_value = labelName) AS label_title,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "linear_score") AS linear_score,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "percentile_score") AS percentile_score
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_*`
    WHERE event_name = "label_used" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
            WHERE key = "label_title" AND value.string_value = labelName) AS label_title,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "linear_score") AS linear_score,
        (SELECT IF(value.double_value IS NOT NULL, value.double_value, 0) FROM UNNEST(event_params)
            WHERE key = "percentile_score") AS percentile_score
    FROM `offshore-recruiter-d9d47.analytics_313603226.events_intraday_*`
    WHERE event_name = "label_used" AND ((forDay AND event_date = startDate) OR (NOT(forDay) AND event_date >= startDate))))
WHERE label_title IS NOT NULL
GROUP BY event_date, label_title
ORDER BY event_date DESC, LOWER(label_title) ASC;