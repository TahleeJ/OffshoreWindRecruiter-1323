# Offshore Wind Job Navigator
A recruiting tool for the offshore wind industry related industry that automates the process of matching applications to job opportunities. Centered on customizable surveys to gauge skills and interests, our tool will match these survey responses to known job opportunities that an applicant could be a good fit to apply for.
This project is a web application supported on both mobile and desktop platforms. Our backend and hosting services will use Firebase, and our frontend uses React with TypeScript. 

# Development Prerequisites
- Git clone this repository
- Node.js installed
- Contact project owner to receive the project's `.env` file and place inside `OffshoreWindJobNavigator-1323/`

Licensed under MIT License

# Frontend
To edit the frontend:
- open the project in an IDE
- open a terminal (ctrl + shift + p in vscode then type new terminal)
- run `npm install` which will create and fill a folder called "node_modules"
- run `npm start` to launch a dev version
- edit the files under "./src/" which will mostly include the components from "./react components"
- only edit the .scss file and compile it to css using the 'live sass compiler" extension

# Backend
## Before You Begin
**After [Development Prerequisites]()* 
1. Contact Firebase project owner to be added as a member of the project
2. Open a terminal session and navigate into `OffshoreWindJobNavigator-1323`
3. Run `npm install` to create your `node_modules` folder with all currently necessary packages required to run the project as specified in `./package.json`
4. Run `firebase login` and login with the account authorized as a member of the Firebase project from [Step 1]()
5. Run `firebase init`
    - Select `Emulators` and press enter
    - Ensure the `Authentication, Functions, Firestore, and Hosting` emulators are selected and press enter
    - Enter "y" and press enter as necessary to select all default options
6. Navigate into `./functions` and run `npm install`

## Project Architecture [Backend]
### Firebase
- **`./firebase.src` defines the Firebase project name
- **`./firebase.json` defines the hosting deployment and local emulator port usage information that Firebase will use
- `./src/firebase/Types.ts` defines all of the custom data types the application uses

** Indicates you do **NOT** need to edit.

### Firestore
`./src/firebase/Queries.ts` holds all of the queries used to interact with Firestore
<br><br>

### Google Cloud Functions
#### **Function Editing/Deployment:**

To add or edit a new function, navigate into `./functions/src` and add your new function in a new `*.ts` file or edit one of the existing `*Functions.ts` files. After writing your function, follow the conventions done in `./src/functions/src/index.ts`.

To deploy your function, run `firebase deploy --only functions:[function  1 name], [function 2 name]` to deploy specific functions or simply stop at `--only function` to deploy all.
<br><br>

#### **Function Testing:**

Unit Testing Suite:

Unit test in this application are written using Mocha in the `./functions/test` location. Before editing the test suite environment, please read through the included [Testing.md]() file. 

To edit an existing test suite, navigate into one of the existing `*.spec.ts*` files and edit accordingly. To create a new testing suite, create a new `.spec.ts` file and follow the conventions in the other test suite files.

To run the test suite environment, run `npm test` in `./functions`.
<br><br>

Application Integrated Testing:

1. Include the following line in `./src/firebase/Firebase.ts`: `functions.connectFunctionsEmulator(functionsInstance, "localhost", 5001);`
2. Navigate into `/OffshoreWindJobNavigator` and, if the application is not already running on localhost, run `npm start`
3. If you would like to test your functions without affecting production, run `firebase emulators:start`, otherwise run `firebase emulators:start --only functions`

<br>

### Job Matching
The job matching process is done via a [custom algorithm]() run in the cloud function `submitSurveyResponse` in `./functions/SurveyFunctions.ts`. More information can be found in [Matching.md]().

<br>

### Analytics
The analytics collected for this application are done via logging functions in `./src/firebase/Analytics/Analytics.ts`, and the data is retrieved from BigQuery via the functions in `./functions/AnalyticsFunctions.ts`. More information can be found in [Analytics.md]().

<br>
# Release Notes v1.0.0

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
