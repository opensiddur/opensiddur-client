<!--
    add an xml:id to all elements in the jf:merged section that don't have one

    Open Siddur Project
    Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:tei="http://www.tei-c.org/ns/1.0"
                xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
                exclude-result-prefixes="#all"
>

    <xsl:template name="add-xmlid" as="attribute()?">
        <xsl:param name="element-name" as="xs:string"/>
        <!-- add a randomly generated xml:id -->
        <xsl:if test="not(@id)">
            <xsl:attribute name="id" select="concat(substring-after($element-name, ':'), '_', generate-id(.))"/>
        </xsl:if>
    </xsl:template>

    <xsl:template match="jf:merged/*">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>

            <xsl:call-template name="add-xmlid">
                <xsl:with-param name="element-name"
                                select="tokenize(@class, '\s+')[starts-with(., 'tei-') or starts-with(., 'j-')]"/>
            </xsl:call-template>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>