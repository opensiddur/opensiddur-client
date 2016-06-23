/* Transcription viewer service
 * Provides APIs for manipulating the transcription viewer
 *
 * Open Siddur Project
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTranscriptionWindowModule.service("TranscriptionViewerService",
    ["PageImageUrlService", "SourceService",
    function (PageImageUrlService, SourceService) {

        return {
            source : "",
            page : 1,
            shown : false,
            activeSource : {
                imageUrl : "",
                sourceArchive : "",
                archiveId : ""
            },
            loadPageImage : function() {
                this.imageUrl = PageImageUrlService.getUrl(
                    this.activeSource.sourceArchive, this.activeSource.archiveId, this.page);
            },
            pageUp : function() {
                this.page += 1;
                this.loadPageImage();
            },
            pageDown : function() {
                this.page -= 1;
                this.loadPageImage();
            },
            setPage : function(pageNum) {
                this.page = pageNum;
                this.loadPageImage();
            },
            setSource : function(newSource) {
                var thiz = this;
                return SourceService.load(newSource).then(function() {
                    console.log("Source loaded");
                    thiz.source = newSource;
                    thiz.activeSource.sourceArchive = SourceService.content.biblStruct.idno._type;
                    thiz.activeSource.archiveId = SourceService.content.biblStruct.idno.__text;
                    thiz.page = 1;
                    thiz.loadPageImage();
                    return thiz;
                });
            },
            show : function() {
                this.shown = true;
            },
            hide : function() {
                this.shown = false;
            },
            toggle : function() {
                this.shown = !this.shown;
            },
            reset : function() {
                this.hide();
                this.activeSource.imageUrl = "";
                this.activeSource.sourceArchive = "";
                this.activeSource.archiveId = "";
                this.page = 1;
                this.source = "";
                return this;
            }
        };
    }]
);
