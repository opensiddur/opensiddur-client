<!-- Set sources

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
    <xsl:param name="new-sources" as="document-node(element(sources))"/>

    <xsl:template match="bibl">
        <xsl:if test="string(source)">
            <tei:bibl>
                <tei:title><xsl:value-of select="normalize-space(title)"/></tei:title>
                <tei:ptr type="bibl" target="/data/sources/{source}"/>
                <tei:ptr type="bibl-content">
                    <xsl:variable name="bibl-content">
                        <xsl:apply-templates select="contents/stream"/>
                    </xsl:variable>
                    <xsl:attribute name="target" select="string-join($bibl-content, ' ')"/>
                </tei:ptr>
                <xsl:if test="string(scope/fromPage)">
                    <tei:biblScope unit="pages" from="{scope/fromPage}" 
                        to="{if (string(scope/toPage)) then scope/toPage else scope/fromPage}"/>
                </xsl:if>
            </tei:bibl>
        </xsl:if>
    </xsl:template>

    <xsl:template match="contents/stream[xs:boolean(streamChecked)]" as="xs:string">
        <xsl:sequence select="concat('#', streamXmlid/string())"/>
    </xsl:template>

    <xsl:template match="contents/stream[not(xs:boolean(streamChecked))]" as="xs:string*">
        <xsl:apply-templates select="id[xs:boolean(checked)][1]"/>
    </xsl:template>

    <xsl:template match="id">
        <xsl:variable name="end-of-run" as="element(id)?"
            select="(following-sibling::id[not(xs:boolean(checked))][1]/preceding-sibling::*[1], 
                following-sibling::id[last()],
                .)[1]"/>

        <xsl:sequence select="string-join((
            '#',
            if (. is $end-of-run) then xmlid 
            else ('range(', xmlid, ',', $end-of-run/xmlid, ')')
            ), '')"/>
        <xsl:apply-templates select="$end-of-run/following-sibling::id[xs:boolean(checked)][1]"/>
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
