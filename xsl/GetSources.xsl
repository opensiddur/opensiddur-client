<!-- Isolate sourceDesc and return a JSON-friendly version

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0"
    >

    <xsl:template match="tei:sourceDesc">
        <sources>
            <xsl:apply-templates select="tei:bibl"/>
        </sources>
    </xsl:template>

    <xsl:template match="tei:bibl">
        <bibl>
            <xsl:variable name="source-uri" select="substring-after(tei:ptr[@type='bibl']/@target, '/data/sources/'))"/> 
            <!-- warning: the title may end up URI encoded -->
            <title><xsl:value-of select="(tei:title, $source-uri)[1]"/></title>
            <source><xsl:value-of select="$source-uri"/></source>
            <scope>
                <fromPage><xsl:value-of select="tei:biblScope/@from"/></fromPage>
                <toPage><xsl:value-of select="tei:biblScope/@to"/></toPage>
            </scope>
            <contents>
                <xsl:apply-templates select="tei:ptr[@type='bibl-content']"/>
            </contents>
        </bibl>
    </xsl:template>

    <xsl:template match="tei:ptr[@type='bibl-content']">
        <xsl:for-each select="tokenize(@target, '\s+')">
            <content><xsl:value-of select="."/></content>
        </xsl:for-each>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="//tei:sourceDesc"/>
    </xsl:template>
    
</xsl:stylesheet>
