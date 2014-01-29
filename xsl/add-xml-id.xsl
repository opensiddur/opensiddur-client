<!--
    add xml:id attributes, where required

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    version="1.0"
    >
    <xsl:output method="xml" indent="yes"/>

    <xsl:template match="j:streamText" mode="generate-xmlid">
    </xsl:template>

    <xsl:template match="*" mode="generate-xmlid">
        <xsl:apply-templates select="parent::*" mode="generate-xmlid"/>
        <xsl:value-of select="concat(local-name(.), count(preceding-sibling::*) + 1)"/>
    </xsl:template>

    <xsl:template match="j:streamText[not(@xml:id)]">
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <xsl:attribute name="xml:id"><xsl:value-of select="concat(local-name(.), '_', generate-id())"/></xsl:attribute>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <!-- any element descendant of a streamText -->
    <xsl:template match="*[ancestor::j:streamText][not(@xml:id)]">
        <xsl:copy>
            <xsl:attribute name="xml:id">
                <xsl:apply-templates select="." mode="generate-xmlid"/>
                <xsl:value-of select="concat('_', generate-id())"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <!-- default: identity template -->
    <xsl:template match="*|comment()">
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
