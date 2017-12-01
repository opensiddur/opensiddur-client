/* Linkage between the editor (CKEditor) and the text service
 *
 * Open Siddur Project
 * Copyright 2017 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */
osTextModule.factory("EditorService", ["AccessService", "LanguageService", "TextService", "$compile",
    function(AccessService, LanguageService, TextService, $compile) {
        return {
            syncEditorToTextService : function() {
                // sync the editor's content into the flatContent of the TextService
                TextService.flatContent(CKEDITOR.instances.editor1.getData());
            },
            syncTextServiceToEditor : function() {
                // sync the text service's flatContent into CKEditor
                CKEDITOR.instances.editor1.setData(TextService.flatContent());
            },
            addCKEditor : function(idOfElement, $scope) {
                // add a CKEditor instance to the given id (#id)
                const language = TextService.language().language;
                const languageDirection = LanguageService.getDirection(language);

                // this should be in $scope.editor, but ng-ckeditor will not allow it to be (see line 73)
                const ckeditorOptions = {
                    autoParagraph: false,
                    basicEntities: false,
                    contentsCss: "/css/simple-editor.css",
                    contentsLangDirection: languageDirection,
                    contentsLanguage: language,
                    customConfig: "/js/ckeditor/config.js",    // points to the plugin directories
                    enterMode: CKEDITOR.ENTER_P,
                    entities: false,   // need XML entities, but not HTML entities...
                    extraPlugins: "language,jf-annotation,jf-conditional,jf-set," +
                    "tei-anchor,tei-div,tei-item,tei-l,tei-p,tei-ptr,tei-seg",
                    fillEmptyBlocks: false,
                    forcePasteAsPlainText: true,
                    height: "65vh",
                    language: "en",
                    language_list: LanguageService.getCkeditorList(),
                    readOnly: !AccessService.access.write,
                    removePlugins: "image",
                    toolbar: "basic",
                    toolbar_full: [],
                    toolbarGroups: [
                        {name: 'clipboard', groups: ['clipboard', 'undo']},
                        {name: 'document', groups: ['mode', 'document', 'doctools']},
                        {name: 'opensiddur', groups: ['opensiddur']},
                        {name: 'editing', groups: ['find', 'selection']},
                        {name: 'insert'},
                        //{ name: 'forms' },
                        //{ name: 'tools' },
                        {name: 'document', groups: ['mode', 'document', 'doctools']},
                        //{ name: 'others' },
                        //'/',
                        //{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                        //{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
                        //{ name: 'styles' },
                        //{ name: 'colors' },
                        //{ name: 'about' }
                    ],
                    removeButtons: 'Paste,PasteFromWord',
                    allowedContent: "p[!id,data-target-base,data-target-fragment,data-type](tei-ptr);" +
                    "p[!id](tei-anchor);" +
                    "p[!id](tei-seg,tei-p,jf-set,layer-phony-set,layer-p,layer,start,end);" +
                    "div[!id](tei-div,tei-l,tei-item,jf-annotation,jf-conditional,layer-div,layer-phony-annotation,layer-phony-conditional,layer-lg,layer-list,layer,start,end);" +
                    "div[id](tei-note);" +
                    "h1[id](tei-head);" +
                    "*[id,lang,dir,data-*];" +
                    "img[src,alt,title];" +
                    "*(editor-*);"
                };
                const parentElement = angular.element(idOfElement);
                if (parentElement.children().length > 0) {
                    // destroy the existing instance before creating a new one
                    CKEDITOR.instances.editor1.destroy();
                }

                parentElement.html("");
                const ckeditor = $compile('<textarea name="editor1" id="editor1"></textarea>')($scope);
                parentElement.append(ckeditor);

                CKEDITOR.replace("editor1", ckeditorOptions);
                this.syncTextServiceToEditor();
                CKEDITOR.instances.editor1.resetDirty();
            },
            getBodyFromElement : function(el) {
                // find the top level body element, given a CKEditor element el
                let currentEl = el;
                while (currentEl.getName() != "body") {
                    currentEl = currentEl.getParent();
                }
                return currentEl;
            }
        };
    }
]);
