import * as chai from 'chai';
import { assert } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import * as functions from 'firebase-functions';
import { WrappedFunction } from 'firebase-functions-test/lib/main';

import { PermissionLevel } from '../../src/firebase/Types';
import { firestore } from '../src/Utility';

import { testEnv, myFunctions } from './Init';
import { ApplicationFlagType, getTestUserPermissionLevel, resetTestDocs, setApplicationFlag, testUserContext, testUserDocRef, updateTransactions } from './Utility';

chai.use(chaiAsPromised);
chai.should();

let updatePermissionsWrapped: WrappedFunction;
let createNewUserWrapped: WrappedFunction;

describe('Update Permissions Function Unit Tests', () => {
    before(async () => {
        updatePermissionsWrapped = testEnv.wrap((await myFunctions).updatePermissions);
    });

    afterEach(async () => {
        await resetTestDocs();
    });

    after(() => {
        testEnv.cleanup();
    });

    describe('None-level caller', () => {
        it('should fail to set a none-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNone, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a none-level user to navigator-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNavigator, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a none-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toAdmin, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a none-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onNone.toOwner, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a none-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onNone.toOwner, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNone, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to navigator-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNavigator, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toAdmin, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onAdmin.toOwner, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onAdmin.toOwner, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to none-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNone, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to none-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNone, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to navigator-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNavigator, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to navigator-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNavigator, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to admin-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toAdmin, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to admin-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toAdmin, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toOwner, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toOwner, testUserContext.none)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });
    });

    describe('Navigator-level caller', () => {
        it('should fail to set a none-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNone, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a none-level user to navigator-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNavigator, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a none-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toAdmin, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a none-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onNone.toOwner, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a none-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onNone.toOwner, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNone, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to navigator-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNavigator, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toAdmin, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onAdmin.toOwner, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onAdmin.toOwner, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to none-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNone, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to none-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNone, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to navigator-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNavigator, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to navigator-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNavigator, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to admin-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toAdmin, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to admin-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toAdmin, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toOwner, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toOwner, testUserContext.navigator)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });
    });

    describe('Admin-level caller', () => {
        it('should fail to set a none-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNone, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should set a none-level user to navigator-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNavigator, testUserContext.admin);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.none);

            assert.equal(permissionLevel, PermissionLevel.Navigator);
        });

        it('should set a none-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toAdmin, testUserContext.admin);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.none);

            assert.equal(permissionLevel, PermissionLevel.Admin);
        });

        it('should fail to set a none-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onNone.toOwner, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a none-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onNone.toOwner, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });
        
        it('should fail to set a navigator-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNavigator.toNone, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should set a navigator-level user to navigator-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNavigator.toNavigator, testUserContext.admin);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.navigator);

            assert.equal(permissionLevel, PermissionLevel.Navigator);
        });

        it('should set a navigator-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNavigator.toAdmin, testUserContext.admin);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.navigator);

            assert.equal(permissionLevel, PermissionLevel.Admin);
        });

        it('should fail to set a navigator-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onNavigator.toOwner, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set a navigator-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onNavigator.toOwner, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNone, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNone, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to navigator-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNavigator, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should set an admin-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toAdmin, testUserContext.admin);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.admin);

            assert.equal(permissionLevel, PermissionLevel.Admin);
        });

        it('should fail to set an admin-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onAdmin.toOwner, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an admin-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onAdmin.toOwner, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to none-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNone, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to none-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNone, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to navigator-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNavigator, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to navigator-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNavigator, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to admin-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toAdmin, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to admin-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toAdmin, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);
            await updatePermissionsWrapped(updateTransactions.onOwner.toOwner, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail to set an owner-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toOwner, testUserContext.admin)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });
    });

    describe('Owner-level caller', () => {
        it('should set a none-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNone, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.none);

            assert.equal(permissionLevel, PermissionLevel.None);
        });

        it('should set a none-level user to navigator-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toNavigator, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.navigator);

            assert.equal(permissionLevel, PermissionLevel.Navigator);
        });

        it('should set a none-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNone.toAdmin, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.none);

            assert.equal(permissionLevel, PermissionLevel.Admin);
        });

        it('should set a none-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);

            await updatePermissionsWrapped(updateTransactions.onNone.toOwner, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.none);

            assert.equal(permissionLevel, PermissionLevel.Owner);
        });

        it('should fail to set a none-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onNone.toOwner, testUserContext.owner)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should set a navigator-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNavigator.toNone, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.none);

            assert.equal(permissionLevel, PermissionLevel.None);
        });

        it('should set a navigator-level user to navigator-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNavigator.toNavigator, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.navigator);

            assert.equal(permissionLevel, PermissionLevel.Navigator);
        });

        it('should set a navigator-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onNavigator.toAdmin, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.navigator);

            assert.equal(permissionLevel, PermissionLevel.Admin);
        });

        it('should set a navigator-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);

            await updatePermissionsWrapped(updateTransactions.onNavigator.toOwner, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.navigator);

            assert.equal(permissionLevel, PermissionLevel.Owner);
        });

        it('should fail to set a navigator-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onNavigator.toOwner, testUserContext.owner)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should set an admin-level user to none-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toNone, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.admin);

            assert.equal(permissionLevel, PermissionLevel.None);
        });

        it('should set an admin-level user to admin-level', async () => {
            await updatePermissionsWrapped(updateTransactions.onAdmin.toAdmin, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.admin);

            assert.equal(permissionLevel, PermissionLevel.Admin);
        });

        it('should set an admin-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);

            await updatePermissionsWrapped(updateTransactions.onAdmin.toOwner, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.admin);

            assert.equal(permissionLevel, PermissionLevel.Owner);
        });

        it('should fail to set an admin-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onAdmin.toOwner, testUserContext.owner)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should set an owner-level user to none-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);

            await updatePermissionsWrapped(updateTransactions.onOwner.toNone, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.owner);

            assert.equal(permissionLevel, PermissionLevel.None);
        });

        it('should fail to set an owner-level user to none-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNone, testUserContext.owner)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should set an owner-level user to navigator-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);

            await updatePermissionsWrapped(updateTransactions.onOwner.toNavigator, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.owner);

            assert.equal(permissionLevel, PermissionLevel.Navigator);
        });

        it('should fail to set an owner-level user to navigator-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toNavigator, testUserContext.owner)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should set an owner-level user to admin-level for enabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, true);

            await updatePermissionsWrapped(updateTransactions.onOwner.toAdmin, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.owner);

            assert.equal(permissionLevel, PermissionLevel.Admin);
        });

        it('should fail to set an owner-level user to admin-level for disabled owner demotion', async () => {
            await setApplicationFlag(ApplicationFlagType.demoteOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toAdmin, testUserContext.owner)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should set an owner-level user to owner-level for enabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, true);

            await updatePermissionsWrapped(updateTransactions.onOwner.toOwner, testUserContext.owner);
            const permissionLevel = await getTestUserPermissionLevel(testUserDocRef.owner);

            assert.equal(permissionLevel, PermissionLevel.Owner);
        });

        it('should fail set an owner-level user to owner-level for disabled owner promotion', async () => {
            await setApplicationFlag(ApplicationFlagType.promoteToOwner, false);
            await updatePermissionsWrapped(updateTransactions.onOwner.toOwner, testUserContext.owner)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });
    });

    describe('Invalid arguments', () => {
        it('should fail with a non-signed in user', async () => {
            await updatePermissionsWrapped(updateTransactions.invalidArg.notSignedIn)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail with an unsupplied target user email', async () => {
            await updatePermissionsWrapped(updateTransactions.invalidArg.absentEmail, testUserContext.invalidArg)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail with a null target user email', async () => {
            await updatePermissionsWrapped(updateTransactions.invalidArg.nullEmail, testUserContext.invalidArg)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail a non-member target user', async () => {
            await updatePermissionsWrapped(updateTransactions.invalidArg.nonMember, testUserContext.invalidArg)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail with an unsupplied permission level', async () => {
            await updatePermissionsWrapped(updateTransactions.invalidArg.absentPermissionLevel, testUserContext.invalidArg)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail with a null permission level', async () => {
            await updatePermissionsWrapped(updateTransactions.invalidArg.nullPermissionLevel, testUserContext.invalidArg)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail with a negative out of bounds permission level', async () => {
            await updatePermissionsWrapped(updateTransactions.invalidArg.negativePermissionLevel, testUserContext.invalidArg)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });

        it('should fail with a positive out of bounds permission level', async () => {
            await updatePermissionsWrapped(updateTransactions.invalidArg.tooLargePermissionLevel, testUserContext.invalidArg)
                .should.eventually.be.rejectedWith(functions.https.HttpsError);
        });
    });
});

describe('Create New User Function Unit Tests', () => {
    before(async () => {
        createNewUserWrapped = testEnv.wrap((await myFunctions).createNewUser);
    });

    after(() => {
        testEnv.cleanup();
    });

    it('should create a None-level document in User/ path with a supplied uid', async () => {
        const newUser = testEnv.auth.exampleUserRecord();

        await createNewUserWrapped(newUser);

        assert.equal((await firestore.collection('User').doc(newUser.uid).get()).exists, true);
        assert.equal((await firestore.collection('User').doc(newUser.uid).get()).data()?.permissionLevel, PermissionLevel.None);
    });
});
