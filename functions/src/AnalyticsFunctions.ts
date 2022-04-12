import * as functions from 'firebase-functions';

import { auth } from './Utility';
import { errors } from "./Errors";

const {BigQuery} = require("@google-cloud/bigquery");
const bigquery = new BigQuery();

export const getBigQueryData = functions.https.onCall(async (request: { queryString: string, navigatorEmail?: string }, context) => {
    if (request.queryString.includes("navigator")) {
        if (request.navigatorEmail == null || request.navigatorEmail == undefined) {
            throw errors.illegalArgument.navigatorEmail;
        }

        try {
            await auth.getUserByEmail(request.navigatorEmail);
        } catch (error) {
            throw errors.invalidUser;
        }
    }  

    const options = {
        query: request.queryString,
        location: "US"
    };

    // Run the query as a job
    const [job] = await bigquery.createQueryJob(options);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

    var data: string[] = [];

    rows.forEach((row: any) => data.push(JSON.stringify(row)));

    return data;
});