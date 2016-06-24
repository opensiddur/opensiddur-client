/* Transcription viewer service
 * Provides APIs for manipulating the transcription viewer
 *
 * Open Siddur Project
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTranscriptionWindowModule.service("TranscriptionViewerService",
    ["$q", "PageImageUrlService", "SourceService",
    function ($q, PageImageUrlService, SourceService) {

        return {
            viewer : {
                
            },
            viewerTemplate : {
                source: "",
                page: 1,
                shown: false,
                activeSource: {
                    imageUrl: "",
                    sourceArchive: "",
                    archiveId: ""
                }
            },
            loadPageImage : function(name) {
                if (this.viewer[name].source != "" && this.viewer[name].activeSource.sourceArchive != "") {
                    this.viewer[name].activeSource.imageUrl = PageImageUrlService.getUrl(
                        this.viewer[name].activeSource.sourceArchive, this.viewer[name].activeSource.archiveId, this.viewer[name].page);
                }
                else {
                    this.viewer[name].activeSource.imageUrl = "";
                }
            },
            pageUp : function(name) {
                this.viewer[name].page += 1;
                this.loadPageImage(name);
            },
            pageDown : function(name) {
                this.viewer[name].page -= 1;
                this.loadPageImage(name);
            },
            setPage : function(name, pageNum) {
                this.viewer[name].page = pageNum || 1;
                this.loadPageImage(name);
            },
            setSource : function(name, newSource) {
                var thiz = this;
                if (!(newSource === undefined) && newSource != "") {
                    return SourceService.load(newSource).then(function () {
                        console.log("Source loaded");
                        var thiv = thiz.viewer[name];
                        thiv.source = newSource;
                        thiv.activeSource.sourceArchive = SourceService.content.biblStruct.idno._type;
                        thiv.activeSource.archiveId = SourceService.content.biblStruct.idno.__text;
                        thiv.page = 1;
                        thiz.loadPageImage(name);
                        return thiz;
                    });
                }
                else return $q.reject(this);
            },
            show : function(name) {
                this.viewer[name].shown = true;
            },
            hide : function(name) {
                this.viewer[name].shown = false;
            },
            toggle : function(name) {
                this.viewer[name].shown = !this.shown;
            },
            isShown : function(name) {
                return (name in this.viewer) ? this.viewer[name].shown : false;
            },
            reset : function(name) {
                var thiv = this.viewer[name];
                this.hide(name);
                thiv.activeSource = {
                    imageUrl : "",
                    sourceArchive : "",
                    archiveId : ""
                };
                thiv.page = 1;
                thiv.shown = false;
                thiv.source = "";
                return this;
            },
            register : function(name) {
                this.viewer[name] = {};
                this.reset(name);
            }
        };
    }]
);
