/* Page image URL service:
 * Get URLs given an archive, archive id, and page#
 *
 * Open Siddur Project
 * Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTranscriptionWindowModule.service("PageImageUrlService",
    function () {
        var patterns = {
            "archive.org" : "http://www.archive.org/download/{archiveId}/page/n{page}.jpg",
            "books.google.com" : "http://books.google.com?id={archiveId}&pg=PR{page}",
            "uri" : "{archiveId}"   // expected to have {page} in it already
        };
        return {
            getUrl : function(archive, archiveId, page) {
                if (archive in patterns) {
                    return patterns[archive].replace("{archiveId}", archiveId).replace("{page}", page);
                }
                return "";
            }
        };
    }
);
