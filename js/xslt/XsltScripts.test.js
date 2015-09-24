/*
    test functions for individual XSLT scripts

    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License version 3 or later
*/

describe("/js/text/AnnotationsMerge.xsl", function() {
    var XsltService;
    var xsl = "/js/text/AnnotationsMerge.xsl";
    var DomParser = new DOMParser();

    beforeEach(function() {
        module("osClient.xslt");
        inject(function(_XsltService_) {
            XsltService = _XsltService_;
        });
    });

    it("replaces an existing note in the annotations block", function() {
        var tei = 
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:text>" +
            "<j:annotations xml:id=\"ann\">" +
            "<tei:note xml:id=\"test_note\" xml:lang=\"en\">old annotation</tei:note>" +
            "</j:annotations>" +
            "</tei:text>" +
            "</tei:TEI>";
        var annotationsResource = DomParser.parseFromString( 
            "<jf:annotationResource xmlns:jf=\"http://jewishliturgy.org/ns/jlptei/flat/1.0\" xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\">" +
            "<jf:annotation id=\"test_note\">" +
            "<tei:note xml:id=\"test_note\" xml:lang=\"en\">test note</tei:note>" +
            "</jf:annotation>" +
            "</jf:annotationResource>", "text/xml").childNodes[0];
        var expected = 
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:text>" +
            "<j:annotations xml:id=\"ann\">" +
            "<tei:note xml:id=\"test_note\" xml:lang=\"en\">test note</tei:note>" +
            "</j:annotations>" +
            "</tei:text>" +
            "</tei:TEI>";
        var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString(xsl, tei, {annotations : annotationsResource}));
        expect(EquivalentXml.isEquivalent(expected, transformed, {normalize_whitespace:true, element_order: true })).toBeTruthy();


    });


    it("adds a note that is passed as a parameter to the annotations block", function() {
        var tei = 
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:text>" +
            "<j:annotations xml:id=\"ann\">" +
            "</j:annotations>" +
            "</tei:text>" +
            "</tei:TEI>";
        var annotationsResource = DomParser.parseFromString( 
            "<jf:annotationResource xmlns:jf=\"http://jewishliturgy.org/ns/jlptei/flat/1.0\" xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\">" +
            "<jf:annotation id=\"test_note\">" +
            "<tei:note xml:id=\"test_note\">test note</tei:note>" +
            "</jf:annotation>" +
            "</jf:annotationResource>", "text/xml").childNodes[0];
        var expected = 
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:text>" +
            "<j:annotations xml:id=\"ann\">" +
            "<tei:note xml:id=\"test_note\">test note</tei:note>" +
            "</j:annotations>" +
            "</tei:text>" +
            "</tei:TEI>";
        var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString(xsl, tei, {annotations : annotationsResource}));
        expect(EquivalentXml.isEquivalent(expected, transformed, {normalize_whitespace:true, element_order: true })).toBeTruthy();

    });

    it("acts as an identity transform if there is no annotation block", function() {
        var tei = 
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:teiHeader>" + 
            "<tei:fileDesc>" +
            "<tei:titleStmt><tei:title type=\"main\" xml:lang=\"en\">Test</tei:title></tei:titleStmt>" +
            "</tei:fileDesc>" +
            "</tei:teiHeader>" +
            "<tei:text>" +
            "<j:streamText xml:id=\"stream\">" +
            "<tei:seg xml:id=\"one\">one segment</tei:seg>" +
            "</j:streamText>" +
            "</tei:text>" +
            "</tei:TEI>";
        var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString(xsl, tei));
        expect(EquivalentXml.isEquivalent(tei, transformed, {normalize_whitespace:true, element_order: true })).toBeTruthy();
        
    });
}); // AnnotationsMerge.xsl

describe("/js/text/Save.template.xsl", function() {
    var XsltService;
    var xsl = "/js/text/Save.template.xsl";

    beforeEach(function() {
        module("osClient.xslt");
        inject(function(_XsltService_) {
            XsltService = _XsltService_;
        });
    });


    it("should act as an identity template for most elements", function() {
        var tei = 
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "   <tei:teiHeader>" + 
            "   </tei:teiHeader>" +
            "   <tei:text>" +
            "           <j:streamText xml:id=\"stream\">" +
            "                   <tei:seg xml:id=\"one\">one segment</tei:seg>" +
            "           </j:streamText>" +
            "   </tei:text>" +
            "</tei:TEI>";
            var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString(xsl, tei));
            expect(EquivalentXml.isEquivalent(tei, transformed, {normalize_whitespace:true, element_order: true })).toBeTruthy();
    });

    it("should remove extra spaces from tei:idno", function() {
        var tei = 
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:idno>     abcdef     </tei:idno>" + 
            "</tei:TEI>";
        var expected =  
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:idno>abcdef</tei:idno>" + 
            "</tei:TEI>";
        var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString(xsl, tei));
        expect(EquivalentXml.isEquivalent(expected, transformed, {normalize_whitespace:false, element_order: true })).toBeTruthy();
    });

    it("should remove the first comment from the commit log", function() {
        var tei = 
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:teiHeader>" +
            "<tei:change><!-- Lalala --></tei:change>" +
            "<tei:change who=\"somebody\" when=\"sometime\">previous</tei:change>" +
            "</tei:teiHeader>" + 
            "</tei:TEI>";
        var expected =  
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:teiHeader>" +
            "<tei:change/>" +
            "<tei:change who=\"somebody\" when=\"sometime\">previous</tei:change>" +
            "</tei:teiHeader>" + 
            "</tei:TEI>";
        var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString(xsl, tei));
        expect(EquivalentXml.isEquivalent(expected, transformed, {normalize_whitespace:true, element_order: true })).toBeTruthy();
    });

    it("should remove extra space from the commit log", function() {
        var tei = 
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:teiHeader>" +
            "<tei:change>    has extra space             </tei:change>" +
            "<tei:change who=\"somebody\" when=\"sometime\">previous</tei:change>" +
            "</tei:teiHeader>" + 
            "</tei:TEI>";
        var expected =  
            "<tei:TEI xmlns:tei=\"http://www.tei-c.org/ns/1.0\" xmlns:j=\"http://jewishliturgy.org/ns/jlptei/1.0\" xml:lang=\"en\">" + 
            "<tei:teiHeader>" +
            "<tei:change>has extra space</tei:change>" +
            "<tei:change who=\"somebody\" when=\"sometime\">previous</tei:change>" +
            "</tei:teiHeader>" + 
            "</tei:TEI>";
        var transformed = XsltService.serializeToStringTEINSClean(XsltService.transformString(xsl, tei));
        expect(EquivalentXml.isEquivalent(expected, transformed, {normalize_whitespace:false, element_order: true })).toBeTruthy();

    });
});

