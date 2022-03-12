# Testing Environment

## Configuration
The testing environment for this project is constructed to work entirely with local Firebase emulators with no interaction with the production environment. All test suite-specific files are under the `functions/test/` directory. The current emulators in use are `functions, firestore, auth`. Cloud functions are tested using the code in `functions/src/index.ts` using the `functions` emulator, and the Admin SDK used in the testing environment (`test/`) is initialized in `index.ts` as well.


## Usage
The testing suite is currently set up to execute all tests in the `functions/test/` directory with a `.spec.ts` extension. Supporting functions and library imports are housed inside of the `functions/test/Utility.ts` file for modularity, but it is not required to place additional functionalities outside of your testing file. Prior to running this test suite, the service account key json file from this project's Google Cloud console must be placed under the `functions/lib/functions/` directory. To run the testing suite, execute the following command: `npm test run` inside of the `functions/` directory.

## Key Notes
This testing suite is scalable but the setup for it is crucial. To ease the testing process, the necessary setup process for each testing file is done in `functions/test/Init.ts` via the function `initializeTestingEnvironment`. Simply set the result of this function call equal to a global variable at the top of your testing suite before any of your tests execute. This will allow you access to the functions created inside `functions/src/index.ts`. **Please execute caution in editing or moving this file, it is designed to make things easier for you**.