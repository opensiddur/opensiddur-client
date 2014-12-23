<!-- Set sources

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0"
    >
    <xsl:param name="new-sources" as="document-node(element(sources))"/>

    <xsl:template match="bibl">
        <xsl:if test="string(source)">
            <tei:bibl>
                <tei:title><xsl:value-of select="normalize-space(title)"/></tei:title>
                <tei:ptr type="bibl" target="/data/sources/{source}"/>
                <xsl:apply-templates select="contents/content"/>
                <xsl:if test="string(scope/fromPage)">
                    <tei:biblScope unit="pages" from="{scope/fromPage}" 
                        to="{if (string(scope/toPage)) then scope/toPage else scope/fromPage}"/>
                </xsl:if>
            </tei:bibl>
        </xsl:if>
    </xsl:template>

    <xsl:template match="content">
        <tei:ptr type="bibl-content" target="{.}"/>
    </xsl:template>

    <xsl:template match="tei:sourceDesc">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates select="$new-sources/sources/bibl"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:sourceDesc/tei:bibl"/>

    <xsl:template match="*">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="comment()|text()"><xsl:copy/></xsl:template>

</xsl:stylesheet>
