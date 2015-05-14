<!--
    Get the properties and text of the segments in a given resource. 

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
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

    <xsl:template match="j:streamText/*[@xml:id|@jf:id|@id]">
        <segment>
            <position><xsl:value-of select="count(preceding-sibling::*)"/></position>
            <name><xsl:value-of select="(@xml:id, @jf:id, @id)[1]"/></name>
            <element><xsl:value-of select="name()"/></element>
            <text><xsl:value-of select="normalize-space(.)"/></text>
            <target><xsl:value-of select="self::tei:ptr/@target"/></target>
            <external><xsl:value-of select="if (self::tei:ptr and substring-before(@target,'#')) then 1 else 0"/></external>
            <inblock>0</inblock>
        </segment>
    </xsl:template>

    <xsl:template match="text()" mode="get-text"><xsl:copy/></xsl:template>

    <xsl:template match="text()"/>

    <xsl:template match="/">
        <segments>
            <xsl:apply-templates/>
        </segments>
    </xsl:template>
</xsl:stylesheet>
