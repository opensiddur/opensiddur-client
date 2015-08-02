<!-- Set sources for an annotation

    Open Siddur Project
    Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0"
    exclude-result-prefixes="#all"
    >
    <!--
        <sources>
            <bibl>
                <title/>
                <source/>
                <scope>
                    <from/>
                    <to/>
                </scope>
                <contents>ignored</contents> 
            </bibl>   
        </sources>
    -->
    <xsl:param name="new-sources" as="document-node(element(sources))"/>
    <xsl:param name="id" as="xs:string"/>
 
    <xsl:variable name="hash-id" select="concat('#', $id)"/>

    <xsl:variable name="new-sources-bibl" as="element(tei:bibl)*">
        <xsl:apply-templates select="$new-sources"/>
    </xsl:variable>
    <xsl:variable name="new-sources-ptrs" as="xs:string*"
        select="$new-sources-bibl/tei:bibl/tei:ptr[@type='bibl']/@target/string()"
        />
    <xsl:variable name="new-sources-contents" as="xs:string*"
        select="for $bc in $new-sources-bibl/tei:bibl/tei:ptr[@type='bibl-content']/@target/string() 
                return tokenize($bc, '\s+')"
        />

    <xsl:template match="sources">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="bibl[contents/stream/streamChecked='true']"/>

    <xsl:template match="bibl">
        <xsl:if test="string(source)">
            <tei:bibl>
                <tei:title><xsl:value-of select="normalize-space(title)"/></tei:title>
                <tei:ptr type="bibl" target="/data/sources/{source}"/>
                <tei:ptr type="bibl-content">
                    <xsl:attribute name="target" select="$hash-id"/>
                </tei:ptr>
                <xsl:if test="string(scope/fromPage[not(.='NaN')])">
                    <tei:biblScope unit="pages" from="{scope/fromPage}" 
                        to="{if (string(scope/toPage)) then scope/toPage else scope/fromPage}"/>
                </xsl:if>
            </tei:bibl>
        </xsl:if>
    </xsl:template>

    <!-- Assumption is that each tei:bibl in the file has a single note referenced in bibl-content and a single source
        possibilities for tei:bibl:
        1. tei:bibl is referencing a different note than $hash-id -> do nothing
        2. tei:bibl references $hash-id -> remove it
    -->
    <!-- existing tei:bibl -->
    <xsl:template match="tei:bibl[not(tei:ptr[@type='bibl-content']/@target=$hash-id)]">
        <xsl:sequence select="."/>
    </xsl:template>

    <xsl:template match="tei:bibl[tei:ptr[@type='bibl-content']/@target=$hash-id]"/>
    
    <xsl:template match="tei:sourceDesc">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
            <xsl:sequence select="$new-sources-bibl"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>
    
    <xsl:template match="comment()|text()"><xsl:copy/></xsl:template>

</xsl:stylesheet>
