<!-- Set title content

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0"
    >
    <xsl:param name="new-titles" as="document-node(element(titles))"/>

    <xsl:template match="title">
        <xsl:if test="string(text)">
            <tei:title 
                xml:lang="{lang}"
                type="{if (position() = 1) then 'main' else 'alt'}"><xsl:value-of select="text"/></tei:title>
        </xsl:if>
        <xsl:if test="string(subText)">
            <tei:title 
                xml:lang="{subLang}"
                type="{if (position() = 1) then 'sub' else 'alt-sub'}"><xsl:value-of select="subText"/></tei:title>
        </xsl:if>
    </xsl:template>

    <xsl:template match="tei:titleStmt">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates select="$new-titles/titles/title"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:titleStmt/tei:title"/>

    <xsl:template match="*">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="comment()|text()"><xsl:copy></xsl:template>

</xsl:stylesheet>
