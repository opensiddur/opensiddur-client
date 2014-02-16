<!-- modify an original text or original text template on load 

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    version="2.0">
    <xsl:output method="xml" indent="yes"/>
    
    <xsl:template match="tei:publicationStmt/tei:date">
        <xsl:copy>
            <xsl:sequence select="@*"/>
            <xsl:choose>
                <xsl:when test="not(normalize-space(.))">
                    <xsl:value-of select="format-date(current-date(), '[Y0001]-[M01]-[D01]')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:apply-templates/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:copy>
    </xsl:template>

    <!-- optional commit log entry -->
    <xsl:template match="tei:revisionDesc">
        <xsl:copy>
            <xsl:sequence select="@*"/>
            <tei:change><xsl:comment>Enter a commit log entry here (optional)</xsl:comment></tei:change>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*|comment()">
        <xsl:copy>
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
