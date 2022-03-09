# Offshore Wind Job Navigator
A recruiting tool for the offshore wind industry related industry that automates the process of matching applications to job opportunities. Centered on customizable surveys to gauge skills and interests, our tool will match these survey responses to known job opportunities that an applicant could be a good fit to apply for.
This project is a web application supported on both mobile and desktop platforms. Our backend and hosting services will use Firebase, and our frontend uses React with TypeScript. 

Licensed under MIT License

# Frontend:
To edit the frontend:
- open the project in an IDE
- open a terminal (ctrl + shift + p in vscode then type new terminal)
- run `npm install` which will create and fill a folder called "node_modules"
- run `npm start` to launch a dev version
- edit the files under "./src/" which will mostly include the components from "./react components"
- only edit the .scss file and compile it to css using the 'live sass compiler" extension

# Release Notes v1.0.0

## v0.2
### Features
- Added ability to connect labels to survey questions as well as to job opportunities 
- Create a new job opportunity
- Edit an existing job opportunity (job name, company name, description, labels attached)
- Delete an existing job opportunity
### Bug Fixes
- Couldn't promote a user to owner level
- submitSurvey function not adding the survey response to FireStore database
### Known Issues
- 

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
