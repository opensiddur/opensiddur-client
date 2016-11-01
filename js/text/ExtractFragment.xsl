<!-- Extract a fragment given start and end points;
    This works on flattened XML documents and has to work on two types:
        (1) combined documents
        (2) single documents that are currently being edited

    Open Siddur Project
    Copyright 2015-2016 Efraim Feinstein
    Licensed under the GNU Lesser General Public License v3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
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
        select="(//html:*[tokenize(@class, '\s+')=concat('id-', $start)]
                [ancestor::*[@data-document][1]/@data-document=$current-document], //html:*[@id=$start])[1]"/>
    <xsl:variable name="end-element" as="element()" 
        select="(//html:*[tokenize(@class, '\s+')=concat('id-', $end)]
            [ancestor::*[@data-document][1]/@data-document=$current-document], //html:*[@id=$end])[1]"/>

    <!-- entry points for combined documents or local documents -->
    <xsl:template match="html:div[contains(@class, 'jf-combined')][ancestor::*[@data-document][1]/@data-document=$current-document] |
                         jf:merged">
        <xsl:variable name="language" select="(ancestor-or-self::*[@lang][1]/@lang, ancestor-or-self::*[@xml:lang][1]/@xml:lang)[1]"/>
        <!-- TODO: language direction is messed up -->
        <div class="ptr-included" 
            lang="{$language}"
            xml:lang="{ancestor-or-self::*[@xml:lang]/@xml:lang}"
            dir="{(ancestor-or-self::*[@dir][1]/@dir, if ($language=('he','arc')) then 'rtl' else 'ltr')[1]}"
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
        <xsl:apply-templates select="//html:div[contains(@class, 'tei-text')]/html:div[contains(@class, 'jf-combined')] | //jf:merged"/>
    </xsl:template>
</xsl:stylesheet>
