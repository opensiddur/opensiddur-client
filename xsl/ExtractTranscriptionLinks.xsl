<!-- Extract transcription links from a document

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    >
    <xsl:output method="xml"/>

    <xsl:template match="tei:sourceDesc/tei:bibl">
        <xsl:variable name="uri" select="tei:ptr[@type='bibl']/@target"/>
        <xsl:variable name="scope-start" as="xs:string?" select="tei:biblScope[@unit='page']/@from"/>
        <xsl:variable name="scope-end" as="xs:string?" select="tei:biblScope[@unit='page']/@to"/>
        <xsl:variable name="source-doc" select="doc(concat('/exist/restxq/api', $uri))" as="document-node()?"/>
        <source>
            <uri><xsl:value-of select="$uri"/></uri>
            <doc><xsl:sequence select="$source-doc"/></doc>
            <title><xsl:value-of select="string-join((
                $source-doc//(tei:analytic, tei:monogr)[1]/tei:title[@type='main' or not(@type)],
                if ($scope-start) then ('[', $scope-start) else (),
                if ($scope-end) then ('-', $scope-end) else (),
                if ($scope-start) then ']' else ()
                ), '')"/></title>
            <scanUrl><xsl:value-of select="replace($source-doc//tei:relatedItem/@targetPattern, '\{page\}', ($scope-start, '0')[1])"/></scanUrl>
            <scopeStart><xsl:value-of select="$scope-start"/></scopeStart>
            <scopeEnd><xsl:value-of select="$scope-end"/></scopeEnd>
        </source>
    </xsl:template>

    <xsl:template match="text()"/>

    <xsl:template match="/">
        <sources>
            <xsl:apply-templates/>
        </sources>
    </xsl:template>
</xsl:stylesheet>
