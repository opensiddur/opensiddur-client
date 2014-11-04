<!-- join a style to its template before saving

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    version="2.0">
    <xsl:output method="xml" indent="yes"/>

    <xsl:param name="style" as="xs:string" select="''"/>
    <xsl:param name="commit-log" as="xs:string" select="''"/>

    <!-- remove the comment and empty commit messages from the commit log, add any commit log message  -->
    <xsl:template match="tei:change[1]">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:value-of select="$commit-log"/>
        </xsl:copy>
    </xsl:template>

    <!-- replace the stylesheet with the context of $style -->
    <xsl:template match="j:stylesheet">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:value-of select="$style"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*|comment()">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>

