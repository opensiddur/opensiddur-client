<!--
    Given XML of the form:
        <blocks>
            <block>
                <left><start/><end/></left>
                <right><start/><end/></right>
            </block>
        </blocks>
    And the context of a translation document, rewrite the translation document content

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    >
    <xsl:output method="xml"/>

    <xsl:param name="leftResource" as="xs:string"/>
    <xsl:param name="rightResource" as="xs:string"/>
    <xsl:param name="leftStream" as="xs:string"/>
    <xsl:param name="rightStream" as="xs:string"/>
    <xsl:param name="blocks" as="document-node()"/>

    <xsl:template match="j:parallelText">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates select="tei:idno"/>
            <tei:linkGrp domains="{$leftResource}#{$leftStream} {$rightResource}#{$rightStream}">
                <xsl:for-each select="$blocks/blocks/block">
                    <tei:link>
                        <xsl:attribute name="target" 
                            select="string-join((
                                $leftResource, '#', 
                                if (left/start=left/end) 
                                then left/start
                                else ('range(', left/start, ',', left/end ,')'),
                                ' ', 
                                $rightResource, '#',
                                if (right/start=right/end) 
                                then right/start
                                else ('range(', right/start, ',', right/end, ')') ), '')"/>
                    </tei:link>
                </xsl:for-each>
            </tei:linkGrp>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*|comment()">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
