/**
 * Based on the simplewidget demo:
 * Copyright (c) 2014, CKSource - Frederico Knabben. All rights reserved.
 * Licensed under the terms of the MIT License (see LICENSE.md).
 * Modifications copyright 2015 Efraim Feinstein, efraim@opensiddur.org
 * Licensed under the GNU Lesser General Public License, version 3 or later
 */

CKEDITOR.dialog.add( 'tei-ptr', function( editor ) {
    var updateExternalList = function(control) { 
        var injector = angular.element('*[data-ng-app]').injector(); 
        var ListingService = injector.get("ListingService");
        var ErrorService = injector.get("ErrorService");
        var query = control.getDialog().getContentElement("tab-props","query").getValue() || "";
        var list = control.getDialog().getContentElement("tab-props", "externalList");
        var isExternal = control.getDialog().getContentElement("tab-props", "transcludeType").getValue() == "external";
        if (isExternal) {
            list.enable();
            ListingService.query("/api/data/original", query)
            .error(function(err) { ErrorService.addApiError(err); } )
            .success(function(data) {
                list.clear(); 
                data.foreach(function (x) { 
                    console.log(x); 
                    list.add(x.title, x.url);
                } ); 
            });
        }
        else {
            list.disable();
            list.clear();
        }
    }
	return {
		title: 'Internal or External Transclusion',
		minWidth: 600,
		minHeight: 300,
        // TODO: edit here
		contents: [
			{
				id: 'tab-props',
				label: 'Basic Properties',

				elements: [
					{
						type: 'text',
						id: 'id',
						label: 'Unique identifier',

						requiredContent: 'a(tei-ptr)[id]',
						validate: CKEDITOR.dialog.validate.notEmpty( "Unique identifier cannot be empty." ),

						setup: function( widget ) {
							this.setValue( widget.data["id"] );
						},

						commit: function( widget ) {
							widget.setData( "id", this.getValue() );
						}
					},
                    {
                        type: 'radio',
                        id: 'transcludeType',
                        label: 'Transclude from:',
                        items: [ [ 'Another document', 'external' ], [ 'This document', 'internal' ] ],
                        'default': 'internal',
                        /*
                        onClick: function() {
                            widget.setData( "link-type", this.getValue() );
                        },
                        */
                        setup : function(widget) {
                            this.setValue(widget.data["link-type"]);
                        },
                        commit : function(widget) {
                            if (widget.data["link-type"] == "internal") 
                                widget.setData("data-target-base", "");
                            updateExternalList(this); 
                        }
                    },
                    {   // search box
                        type: 'hbox',
                        widths: [ '75%', '25%' ],
                        children : [
                            {
                                type: 'text',
                                id: 'query',
                                label: "Search",
                                commit : function (data) {
                                    data.query = this.getValue();
                                }
                            },
                            {
                                type: 'button',
                                id : 'queryButton',
                                label : 'Search',
                                onClick : function () {
                                    updateExternalList(this);
                                }
                            }
                        ]
                    },
                    {   // resource list box
                        type : 'select',
                        id : 'externalList',
                        label : 'Documents',
                        items : [],
                        'default' : "",
                        setup : function () {
                            updateExternalList(this);
                        },
                        onChange : function ( a ) {
                            console.log("selected: " + this.getValue());
                        }
                    }

				]
			}

		],
	};
} );
