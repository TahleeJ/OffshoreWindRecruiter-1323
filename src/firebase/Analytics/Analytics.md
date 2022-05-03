# OSWJN Analytics Process
This application utilizes Google Analytics 4 for its analytics purposes. These purposes can be broken down into 3 parts as described below:

1. Event logging to Firebase-integrated Google BigQuery
2. Data querying from BigQuery
3. Customized chart generation using serialized data

## Event Logging
Event logging for this application is done via the functions located in `./src/firebase/Analytics/Logging.ts` with the prefix `log`. Logging events of any name can be created, but when attempting to use dimension names (e.g., "created_survey_title") unrecognized by Firebase Analytics by default, you will have to register them as custom definitions within this project's Firebase Analytics console. To begin logging events after creating a logging function and registering desired custom parameters, simply include a call to the logging function wherever the event should be triggered (e.g., upon a survey submission).

Once a logging function call has been placed in the proper trigger collection, data will automatically be sent to BigQuery, which is a linked integration for this Firebase project. For this integration configuration, data will be propagated on an intra-day and per-day basis. While intra-day propagation does happen throughout the day, it does *not* propagate in realtime. Although this can hinder the testing process, there is a way to view collected data in semi-realtime:

1. For each custom event parameter not implicitly recognized by GA4, add it as a custom definition in the project's Firebase console
2. Include `debug_mode: true` in each of the logging events you would like to track in realtime
3. Install the Google Analytics Debugger extension on Chrome
4. Navigate into the Firebase project's "DebugView"
5. Start the application and begin triggering the events (*it may take a few tries and minutes to start seeing the data appear in DebugView*)

## Data Querying from BigQuery
To view the data currently accessible in the linked BigQuery integration, open the "View in BigQuery" link from BigQuery's integration manager in this project's Firebase console.

*Before attempting to retrieve data from the application, it is highly recommended to construct your data queries inside of the SQL workspace. The queries inside of `queries.sql` do **NOT** affect the available queries that BigQuery can use, they are only there for quick reference.*

The administered survey queries available to the project are accessible in `Administered Survey Queries`, the job queries are accessible in `Matched Job Queries`, and the label queries are accessible in `Label Queries` within BigQuery. After editing a query file, make sure to run and save your queries before attempting to use them in the application.

Post-creation, the names of the each SQL table function will then be manually put into the `queryFunctions` variable and `DataQuery` data type defined in `./src/firebase/Analytics/Utility.ts` for easy reference and manipulation. Queries made made available to BigQuery are used inside of the functions in `./src/functions/AnalyticsFunctions.ts` to query data as need be. 

## Chart Generation
The [Google] charts for the analytics dashboard are achieved by way of a pipelined process:

1. Custom chart selection
2. Data query type assertion
3. Preliminary data querying
4. Cloud function data querying
5. Data serialization
6. Chart generation

### Custom Chart Selection
When entering into the analytics dashboard of the application in `./src/react components/Analytics.tsx`, the user will have the ability to choose what type of data they would like to see alongside the visualization (chart) they would like to view it in. After this selection is done (by clicking `generateChart`), the application will then determine which type of data query needs to be sent to BigQuery, starting through the `drawChart` function in `./src/firebase/Analytics/Draw.ts`.

### Data Query Type Assertion
To determine the type of data query that needs to be sent out, the application will know exactly which data queries for each chart type from the maps in `./src/firebase/Analytics/Utility.ts` for each subject type listing the valid queries for each chart type and the text to display to the user. If the user has selected a data query that is valid for the type of chart they selected, a preliminary query will be made through `getQueryData` in `./src/firebase/Analytics/Query.ts`.

### Preliminary Data Query
For optimization purposes, the application will know which query to send to BigQuery based on the selected chart and data selection. This is done to take away some of the processing power needed to be done by the querying cloud functions. The application will know which query to make as well as how many times to call the cloud function `getBigQueryData` in `./functions/AnalyticsFunctions.ts` to do it.

### Cloud Function Data Query
After determining which data to retrieve from BigQuery and how, the cloud function `getAnalyticsData` in `./functions/AnalyticsFunctions.ts` will use the determined query to actually request data from BigQuery. Once this query job has been completed, the retrieved data will be sent back as JSON and then be sent through a serialization process in `serializeQueryData` in `./src/firebase/Analytics/Query.ts`.

### Data Serialization
All of the serialization of the retrieved analytics data from BigQuery will be done in `serializeQueryData` in `./src/firebase/Analytics/Query.ts`. This serialization process will use the event dimensions as defined in the [event logging functions](https://github.com/TahleeJ/OffshoreWindJobNavigator-1323/blob/main/src/firebase/Analytics/Analytics.md#event-logging). To provide standardization for the way in which the received data will be read, all of the JSON information will be transformed into `Serialized Entry` objects as defined in `./src/firebase/Analytics/Utility.ts` as well as strings as necessary (according to the original data query type). After this serialization process has been completed, the newly transformed data will be sent back to the original `drawChart` function call in `./src/firebase/Analytics/Draw.ts` where the chart will finally be rendered onto the screen.

