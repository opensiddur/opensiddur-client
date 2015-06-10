/* tests for the error module

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
 */
'use strict';

describe('osError module', function() {
    beforeEach(module('osError'));

    describe("ErrorService", function() {
        var ErrorService;

        beforeEach(inject(function(_ErrorService_) {
            ErrorService = _ErrorService_;
        }));
        describe("when an alert is added", function() {
            beforeEach(function() { ErrorService.addAlert("message", "info") });
            it("should add the message to the list", function() {
                expect(ErrorService.messages.length).toEqual(1);
                expect(ErrorService.messages[0].message).toEqual("message");
                expect(ErrorService.messages[0].level).toEqual("info");
            });

            it("should add the second message after a first", function() {
                ErrorService.addAlert("message2", "debug");

                expect(ErrorService.messages.length).toEqual(2);
                expect(ErrorService.messages[1].message).toEqual("message2");
                expect(ErrorService.messages[1].level).toEqual("debug");
            });

            afterEach(function() { ErrorService.messages = []; });
        });

        describe("when an API error is added", function() {
            beforeEach(function() { ErrorService.addApiError("<error><path>/path</path><message>API Error message</message><object>object</object></error>") });
            it("should add the message to the list as an error", function() {
                expect(ErrorService.messages.length).toEqual(1);
                expect(ErrorService.messages[0].message).toEqual("API Error message");
                expect(ErrorService.messages[0].level).toEqual("error");
            });

            afterEach(function() { ErrorService.messages = []; });
        });

        describe("when an alert is closed", function() {
            beforeEach(function() { 
                ErrorService.addAlert("message", "error"); 
                ErrorService.addAlert("message2", "error"); 
                ErrorService.closeAlert(0); 
            });

            it("should remove the indicated message", function() {
                expect(ErrorService.messages.length).toEqual(1);
                expect(ErrorService.messages[0].message).toEqual("message2");
            }); 
            
            afterEach(function() { ErrorService.messages = []; });
            
        });
    });
});
