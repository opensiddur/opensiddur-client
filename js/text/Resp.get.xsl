<!-- Isolate responsibility statements to make them easily processed into JSON

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0"
    >

    <xsl:template match="tei:titleStmt">
        <respStmts>
            <xsl:apply-templates select="tei:respStmt"/>
        </respStmts>
    </xsl:template>

    <xsl:template match="tei:respStmt">
        <respStmt>
            <respType><xsl:value-of select="tei:resp/@key"/></respType>
            <respText><xsl:value-of select="tei:resp"/></respText>
            <respRef><xsl:value-of select="tei:name/@ref"/></respRef>
            <respName><xsl:value-of select="tei:name"/></respName>
        </respStmt>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="//tei:titleStmt"/>
    </xsl:template>
    
</xsl:stylesheet>
