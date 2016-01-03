<!-- Extract a fragment given start and end points 

    Open Siddur Project
    Copyright 2015 Efraim Feinstein
    Licensed under the GNU Lesser General Public License v3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns="http://www.w3.org/1999/xhtml"
    version="2.0"
    >
    <!-- start id -->
    <xsl:param name="start" as="xs:string"/>

    <!-- end id -->
    <xsl:param name="end" as="xs:string"/>

    <!-- maximum level of inclusion to do -->
    <xsl:param name="max-inclusion-level" as="xs:integer" select="5"/>

    <xsl:variable name="current-document" as="xs:string" 
        select="root()/*/@data-document"/>
    <xsl:variable name="start-element" as="element()" 
        select="//html:*[tokenize(@class, '\s+')=concat('id-', $start)]
                [ancestor::*[@data-document][1]/@data-document=$current-document]"/>
    <xsl:variable name="end-element" as="element()" 
        select="//html:*[tokenize(@class, '\s+')=concat('id-', $end)]
            [ancestor::*[@data-document][1]/@data-document=$current-document]"/>

    <xsl:template match="html:div[contains(@class, 'jf-combined')][ancestor::*[@data-document][1]/@data-document=$current-document]">
        <div class="ptr-included" 
            lang="{ancestor-or-self::*[@lang][1]/@lang}"
            xml:lang="{ancestor-or-self::*[@xml:lang]/@xml:lang}"
            dir="{ancestor-or-self::*[@dir][1]/@dir}"
            >
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="*">
        <xsl:param name="inclusion-level" tunnel="yes" as="xs:integer" select="0"/>
        <xsl:if test="
            $inclusion-level &lt; $max-inclusion-level
            and (
                . is $start-element 
                or . is $end-element 
                or (. &gt;&gt; $start-element and . &lt;&lt; $end-element)
                or descendant::*[. is $start-element] 
                or ancestor::*[. is $start-element] 
                or descendant::*[. is $end-element]
                or ancestor::*[. is $end-element] 
            )">
            <xsl:copy copy-namespaces="no">
                <xsl:copy-of select="@*"/>
                <xsl:apply-templates>
                    <xsl:with-param name="inclusion-level" tunnel="yes" as="xs:integer"
                        select="if (@data-document) 
                            then (1 + $inclusion-level)
                            else $inclusion-level"/>
                </xsl:apply-templates>
            </xsl:copy>
        </xsl:if>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="//html:div[contains(@class, 'tei-text')]/html:div[contains(@class, 'jf-combined')]"/>
    </xsl:template>
</xsl:stylesheet>
