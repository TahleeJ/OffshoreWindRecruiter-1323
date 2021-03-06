# 🌊 Offshore Wind Recruiter
A recruiting tool for the offshore wind industry related industry that automates the process of matching applications to job opportunities. Centered on customizable surveys to gauge skills and interests, our tool will match these survey responses to known job opportunities that an applicant could be a good fit to apply for.
This project is a web application supported on both mobile and desktop platforms. Our backend and hosting services use Firebase, and our frontend uses React with TypeScript.

*Licensed under the MIT License*

# Installation & Launch Guide
## Setup
- Install [Node.js](https://nodejs.org/en/download/)
- Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and clone this repository
- Contact Firebase project owner to be added as a member of the project
- Contact project owner to receive the project's `.env` file and place inside `OffshoreWindJobNavigator-1323/`
- Run `npm install` which will create and fill a folder called "node_modules". This should be run whenever new node packages have been added

## React Webpage
1. (Optional) Open the cloned repository in an IDE
2. Open a terminal session of your choosing and go to the root directory
3. Run `npm start` to launch a dev version in localhost

## Local Firebase Instance (Optional for Frontend)
1. Open a terminal and go to the root directory
2. Run `firebase login` and login with the account authorized as a member of the Firebase project in [setup](https://github.com/TahleeJ/OffshoreWindJobNavigator-1323/blob/50e2c237f98ae011a4d7817ca7c60a382fdb3659/README.md#setup)
3. Run `firebase init`
    - Select `Emulators` and press enter
    - Ensure the `Authentication, Functions, Firestore, and Hosting` emulators are selected and press enter
    - Enter "y" and press enter as necessary to select all default options
4. Navigate into `./functions` and run `npm install`

# Project Architecture
## React & Redux
- `./src/index.js` is the entry point for the whole application. It's sole purpose is to render `./src/App.tsx` inside a redux provider
- `./src/App.tsx` renders a collection of different pages depending on the current `pageType` in the redux store (see diagram below)
- All of the other frontend react files are under `./src/` which will mostly include the components from `./react components/`
- For styling, edit the `./src/styling/App.scss` file and compile it to css using the 'live sass compiler" extension in vscode (or equivalent)

## Firebase
- **`./.firebaserc` defines the Firebase project name
- **`./firebase.json` defines the hosting deployment and local emulator port usage information that Firebase will use
- `./src/firebase/Types.ts` defines all of the custom data types the application uses

** Indicates you do **NOT** need to edit.

## Firestore
`./src/firebase/Queries/` holds all of the custom queries used to interact with Firestore


## Google Cloud Functions
### Function Editing/Deployment

To add or edit a new function, navigate into `./functions/src/` and add your new function in a new `*.ts` file or edit one of the existing `*Functions.ts` files. After writing your function, follow the conventions done in `./src/functions/src/index.ts`. To make a function accessible throughout the application, follow the cloud function conventions done in `./src/firebase/Firebase.ts`.

To deploy your function, run `firebase deploy --only functions:[function  1 name], [function 2 name]` to deploy specific functions or run `firebase deploy --only functions` to deploy all.


## Google Cloud Hosting
### Website Deployment

To deploy or redeploy the website to Google Cloud Hosting, run `firebase deploy --only hosting`.

<br>

### Function Testing
#### **Unit Testing Suite**

Unit test in this application are written using Mocha in the `./functions/test` location. Before editing the test suite environment, please read through the included [Testing.md](https://github.com/TahleeJ/OffshoreWindJobNavigator-1323/blob/98e387223503347dd8e4f589722fb62eef3dfd19/functions/Testing.md) file.

To edit an existing test suite, navigate into one of the existing `*.spec.ts` files and edit accordingly. To create a new testing suite, create a new `.spec.ts` file and follow the conventions in the other test suite files.

To run the test suite environment, run `npm test` in `./functions/`.



#### **Application Integrated Testing**

1. Include the following line in `./src/firebase/Firebase.ts`: `functions.connectFunctionsEmulator(functionsInstance, "localhost", 5001);`
2. Navigate into `/OffshoreWindJobNavigator/` and, if the application is not already running on localhost, run `npm start`
3. If you would like to test your functions without affecting production, run `firebase emulators:start`, otherwise run `firebase emulators:start --only functions`



## Job Matching
The job matching process is done via a custom algorithm run in the cloud function `submitSurveyResponse` in `./functions/SurveyFunctions.ts`.


## Analytics
The analytics collected for this application are done via logging functions in `./src/firebase/Analytics/Analytics.ts`, and the data is retrieved from BigQuery via `getBigQueryData` in `./functions/AnalyticsFunctions.ts`. More information can be found in [Analytics.md](https://github.com/TahleeJ/OffshoreWindJobNavigator-1323/blob/ceb920c68fdbcef766e29e1bd2936f1960bd87be/src/firebase/Analytics/Analytics.md).



# Release Notes
## v1.0.0
### Features
- Ability to download survey response after submitting a survey
- New job exploration page
- New analytics dashboard for surveys, matched jobs, and labels
- Different default launch page for each permission level
- Informational tooltips spread throughout application
- New Offshore Wind Industry education page
- Ability to add images/videos and text when creating a survey
- Ability to change the permission level of multiple users at once
### Bug Fixes
- Card view available for users with navigator-level permissions
- Proper permissions updatability with new navigator-level permissions
- Label selector page overflow on survey creator page
- Prevent survey creation with empty questions
- Prevent duplicate survey title creation
### Known Issues
- Survey response view only shows answers for scale-type questions
- Deleting a label does not give warning for connected components

## v0.4
### Features
- Card view available for administrable surveys on home screen
- Survey responses visible from admin home screen
- Popups for required fields left blank when attempting to submit a survey
- Recommended job view upon survey submission
- Scrollability for list views on admin dashboard
- Ability to view labels connected to jobs
### Bug Fixes
- Surveys include default survey-taker information
- Ability to promote a user to owner-level
- submitSurvey function adds submitted surveys to Firestore
### Known Issues
- Survey response view only shows answers for scale-type questions

## v0.3
### Features
- Added ability to connect labels to survey questions as well as to job opportunities
- Create a new job opportunity
- Edit an existing job opportunity (job name, company name, description, labels attached)
- Delete an existing job opportunity
- Allow admins and owners to promote other users
- Allow surveys to be administered
- Calculate recommended jobs based on a survey response
### Bug Fixes
- Couldn't promote a user to owner level
- submitSurvey function not adding the survey response to Firestore database

## v0.2
### Features
- Removed redundant extra header button
- Application uses Firebase instead of Amplify, reducing costs
- Create new survey template
- Edit survey template (title, description, questions)
- Delete survey template
- Hide admin dashboard from Navigators
- Create new label
- Edit existing labels
- Delete labels
### Bug Fixes
- Page overscroll issue
- Survey lists pull from live database
### Known Issues
- Deleting items does not provide a confirmation

## v0.1
### Features
- User signup page (with email verification)
- User login page
- Oauth with Google
- Template navigator dashboard
- Template admin dashboard
### Bug Fixes
- N/A
### Known Issues
- Admin dashboard has 3 extra scrollbars
- Survey list does not pull from database
