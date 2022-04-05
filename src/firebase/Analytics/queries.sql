/*
    *****WARNING*****

    Editing this file will NOT change the available queries. This file
    is purely for reference.

    To edit the available queries for BigQuery, please visit this site:
    https://console.cloud.google.com/bigquery?project=hallowed-digit-338620

    It is highly recommended to edit queries at the link above as that will
    provide the quickest method of testing.
*/

-- Total survey title per day
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_all_title_day() AS
SELECT event_date, survey_title, COUNT(survey_title) AS frequency
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered")
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered"))
GROUP BY event_date, survey_title;

-- Total survey per day
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_all_day() AS
SELECT event_date, COUNT(survey_title) AS frequency
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered")
    UNION ALL
    (SELECT event_date, 
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered"))
GROUP BY event_date;

-- Total survey title
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_all_titles() AS
SELECT survey_title, COUNT(survey_title) AS frequency
FROM (
    (SELECT   
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered")
    UNION ALL
    (SELECT   
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered"))
GROUP BY survey_title;

-- Total survey title per day for each
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_each_title_day() AS
SELECT event_date, survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered")
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered"))
GROUP BY event_date, survey_title, navigator;

-- Total survey per day for each
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_each_day() AS
SELECT event_date, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered")
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered"))
GROUP BY event_date, navigator;

-- Total survey for each
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_each_titles() AS
SELECT survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
        (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered")
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered"))
GROUP BY survey_title, navigator;

-- Total survey title per day for navigator
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_navigator_title_day(name STRING) AS
SELECT event_date, survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name)
    UNION ALL
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name))
GROUP BY event_date, survey_title, navigator;

-- Total survey per day for navigator
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_navigator_day(name STRING) AS
SELECT event_date, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name)
    UNION ALL
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name))
GROUP BY event_date, navigator;

-- Total survey for navigator
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_navigator_titles(name STRING) AS
SELECT survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name)
    UNION ALL
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name))
GROUP BY survey_title, navigator;