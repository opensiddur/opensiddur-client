<!-- List xml:ids by name, giving context, if it's in a stream
    It is expected to be run against the original document 
    May also run against a flattened/HTML original document

    Open Siddur Project
    Copyright 2014-2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    >
    <xsl:output method="xml"/>
    <xsl:param name="context-chars" as="xs:double" select="30"/>

    <xsl:template match="*[@xml:id|@id]">
        <xmlid>
            <name><xsl:value-of select="(@xml:id, @id)[1]"/></name>
            <element><xsl:value-of select="
                string-join((name(),
                    if (@type or @data-type) then ('[', (@type, @data-type)[1], ']') else ()
                    ), '')"/></element>
            <stream><xsl:value-of select="if (parent::j:streamText | parent::html:div/parent::tei:text) then 'Y' else 'N'"/></stream>
            <context>
                <xsl:variable name="text" select="normalize-space(.)"/>
                <xsl:value-of select="
                    if (string-length($text) > ($context-chars + 1))
                    then 
                        concat(substring($text, 1, ($context-chars idiv 2)), '...', substring($text, string-length($text) - ($context-chars idiv 2 - 1), ($context-chars idiv 2)))
                    else $text"/></context>
        </xmlid>
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="text()" mode="get-text"><xsl:copy/></xsl:template>

    <xsl:template match="text()"/>

    <xsl:template match="/">
        <xmlids>
            <xsl:apply-templates/>
        </xmlids>
    </xsl:template>
</xsl:stylesheet>
