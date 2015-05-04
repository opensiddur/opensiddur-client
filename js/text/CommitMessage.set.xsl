<!-- Set commit message (parameter is a string)

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0"
    >
    <xsl:param name="commit-message" as="xs:string"/>

    <!-- the first tei:change element is always the editable one -->
    <xsl:template match="tei:change[1]">
        <xsl:variable name="normalized" select="normalize-space($commit-message)"/>
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:if test="$normalized">
                <xsl:value-of select="$normalized"/>
            </xsl:if>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*|comment()|text()">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>
    
</xsl:stylesheet>
