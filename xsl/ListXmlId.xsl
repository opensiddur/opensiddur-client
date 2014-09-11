<!-- List xml:ids by name, giving context, if it's in a stream
    It is expected to be run against the original document 

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    version="2.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    >
    <xsl:output method="xml"/>

    <xsl:template match="*[@xml:id]">
        <xmlid>
            <name><xsl:value-of select="@xml:id"/></name>
            <element><xsl:sequence select="
                string-join((name(),
                    if (@type) then ('[', @type, ']') else ()
                    ), '')"/></element>
            <stream><xsl:sequence select="if (parent::j:streamText) then 'Y' else 'N'"/></stream>
            <context>
                <xsl:variable name="text" select="normalize-space(.)"/>
                <xsl:value-of select="
                    if (string-length($text) > 31)
                    then 
                        concat(substring($text, 1, 15), '...', substring($text, string-length($text) - 14, 15))
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
