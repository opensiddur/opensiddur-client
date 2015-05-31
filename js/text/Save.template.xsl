<!-- clean up an original template before saving to the database  

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

    <!-- remove the comment and empty commit messages from the commit log  -->
    <xsl:template match="tei:change[1]/comment()"/>
    <xsl:template match="tei:change[1]/text()[not(matches(., '\S'))]"/>
    <xsl:template match="tei:change[1]/text()"><xsl:sequence select="normalize-space(.)"/></xsl:template>

    <!-- remove leading and trailing spaces from idno -->
    <xsl:template match="tei:idno/text()">
        <xsl:sequence select="replace(., '^\s+|\s+$', '')"/>
    </xsl:template>

    <xsl:template match="*|comment()">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>

