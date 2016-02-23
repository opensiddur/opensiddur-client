<!--
    Get the properties and text of the segments in a given resource. 

    Open Siddur Project
    Copyright 2015-2016 Efraim Feinstein, efraim@opensiddur.org
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

    <xsl:param name="side" as="xs:string"/>

    <xsl:template match="j:streamText/*[@xml:id|@jf:id|@id]">
        <segment>
            <position><xsl:sequence select="count(preceding-sibling::*)"/></position>
            <side><xsl:sequence select="$side"/></side>
            <name><xsl:value-of select="(@xml:id, @jf:id, @id)[1]"/></name>
            <element><xsl:value-of select="name()"/></element>
            <text><xsl:value-of select="normalize-space(.)"/></text>
            <target><xsl:value-of select="self::tei:ptr/@target"/></target>
            <external><xsl:sequence select="if (self::tei:ptr[not(@type='inline')] and substring-before(@target,'#')) then 1 else 0"/></external>
            <inblock>0</inblock>
        </segment>
    </xsl:template>

    <xsl:template match="text()" mode="get-text"><xsl:copy/></xsl:template>

    <xsl:template match="text()"/>

    <xsl:template match="/">
        <segments domain="{//j:streamText/@xml:id}">
            <xsl:apply-templates/>
        </segments>
    </xsl:template>
</xsl:stylesheet>
