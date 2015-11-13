/* LicensesService: manage information related to supported copyright licenses
 *
 * Open Siddur Project
 * Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osGlobalDataModule.factory("LicensesService", function() {
    return {
        supportedLicenses : {
            "http://www.creativecommons.org/publicdomain/zero/1.0" : "Creative Commons Zero 1.0",
            "http://www.creativecommons.org/licenses/by/4.0" : "Creative Commons Attribution 4.0",
            "http://www.creativecommons.org/licenses/by-sa/4.0" : "Creative Commons Attribution-ShareAlike 4.0",
            "http://www.creativecommons.org/licenses/by/3.0" : "Creative Commons Attribution 3.0 Unported",
            "http://www.creativecommons.org/licenses/by-sa/3.0" : "Creative Commons Attribution-ShareAlike 3.0 Unported"
        }
    };
});
