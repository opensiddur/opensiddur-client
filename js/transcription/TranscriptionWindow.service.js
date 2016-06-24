/** Transcription Window service
 * Created by efeins on 6/23/16.
 * 
 * Provides APIs for manipulating the transcription "window"
 *
 * Open Siddur Project
 * Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTranscriptionWindowModule.service("TranscriptionWindowService",
    ["TextService", "TranscriptionViewerService",
        function(TextService, TranscriptionViewerService) {
            return {
                sources : [],
                currentSource : null,
                refresh : function() {
                    this.sources = TextService.sources();
                    if (this.sources.length > 0) {
                        this.currentSource = this.sources[0];
                        this.setSource();
                    }
                    return this;
                },
                setSource : function() {
                    var thiz = this;
                    return TranscriptionViewerService.setSource("transcription-window", this.currentSource.source).
                        then(function() {
                            return TranscriptionViewerService.setPage("transcription-window",
                                parseInt(thiz.currentSource.scope.fromPage));
                        });
                }
            };
        }
    ]);
