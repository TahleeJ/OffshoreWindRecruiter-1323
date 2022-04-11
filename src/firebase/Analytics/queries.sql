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

-- Total survey title per day
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_all_title_day(forDay BOOLEAN, day STRING) AS
SELECT event_date, survey_title, COUNT(survey_title) AS frequency
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay))))
GROUP BY event_date, survey_title
ORDER BY event_date DESC, LOWER(survey_title) ASC;

-- Total survey per day
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_all_day(forDay BOOLEAN, day STRING) AS
SELECT event_date, COUNT(survey_title) AS frequency
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay)))
    UNION ALL
    (SELECT event_date, 
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay))))
GROUP BY event_date
ORDER BY event_date DESC;

-- Total survey title
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_all_titles(forDay BOOLEAN, day STRING) AS
SELECT survey_title, COUNT(survey_title) AS frequency
FROM (
    (SELECT   
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay)))
    UNION ALL
    (SELECT   
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay)))
    LIMIT 365)
GROUP BY survey_title
ORDER BY LOWER(survey_title) ASC;

-- Total survey title per day for each
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_each_title_day(forDay BOOLEAN, day STRING) AS
SELECT event_date, survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay))))
GROUP BY event_date, survey_title, navigator
ORDER BY event_date DESC, LOWER(survey_title) ASC;

-- Total survey per day for each
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_each_day(forDay BOOLEAN, day STRING) AS
SELECT event_date, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay))))
GROUP BY event_date, navigator
ORDER BY event_date DESC;

-- Total survey for each
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_each_titles(forDay BOOLEAN, day STRING) AS
SELECT survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay)))
    UNION ALL
    (SELECT event_date,
        (SELECT value.string_value FROM UNNEST(event_params)
          WHERE key = "administering_navigator") AS navigator,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`
    WHERE event_name = "survey_administered" AND ((forDay AND event_date = day) OR NOT(forDay)))
    LIMIT 365)
GROUP BY survey_title, navigator
ORDER BY LOWER(survey_title) ASC;

-- Total survey title per day for navigator
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_navigator_title_day(name STRING, forDay BOOLEAN, day STRING) AS
SELECT event_date, survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name AND ((forDay AND event_date = day) OR NOT(forDay)))
    UNION ALL
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name AND ((forDay AND event_date = day) OR NOT(forDay))))
GROUP BY event_date, survey_title, navigator
ORDER BY event_date DESC, LOWER(survey_title) ASC;

-- Total survey per day for navigator
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_navigator_day(name STRING, forDay BOOLEAN, day STRING) AS
SELECT event_date, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name AND ((forDay AND event_date = day) OR NOT(forDay)))
    UNION ALL
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name AND ((forDay AND event_date = day) OR NOT(forDay))))
GROUP BY event_date, navigator
ORDER BY event_date ASC;

-- Total survey for navigator
CREATE OR REPLACE TABLE FUNCTION analytics_305371849.get_navigator_titles(name STRING, forDay BOOLEAN, day STRING) AS
SELECT survey_title, COUNT(survey_title) AS frequency, navigator
FROM (
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name AND ((forDay AND event_date = day) OR NOT(forDay)))
    UNION ALL
    (SELECT event_date,  
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administered_survey_title") AS survey_title,
        (SELECT value.string_value FROM UNNEST(event_params) 
            WHERE key = "administering_navigator") AS navigator
    FROM `hallowed-digit-338620.analytics_305371849.events_intraday_*`, UNNEST(event_params) AS P
    WHERE event_name = "survey_administered" AND P.value.string_value = name AND ((forDay AND event_date = day) OR NOT(forDay)))
    LIMIT 365)
GROUP BY survey_title, navigator
ORDER BY LOWER(survey_title) ASC;