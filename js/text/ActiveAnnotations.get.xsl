<!--
    get the annotations that are active at a given id. if no idea is given, the streamText is assumed

    <annotations>
        <annotation>
            <name>[annotation name]</name>
            <state>YES|NO</state>
        </annotation>
    </annotations>

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    version="2.0"
    exclude-result-prefixes="#all">
    <!-- filter that it must begin|end at an id, {id}, start_{id} or end_{id} -->
    <xsl:param name="id" as="xs:string?" select="(//j:streamText|//jf:merged)/(@xml:id|@jf:id)/string()"/>

    <xsl:template match="j:settings/tei:fs[@type='opensiddur:annotation']">
        <xsl:apply-templates />
    </xsl:template>

    <xsl:template match="tei:f">
        <annotation>
            <name><xsl:sequence select="string(@name)"/></name>
            <state><xsl:apply-templates/></state>
        </annotation>
    </xsl:template>

    <xsl:template match="tei:f/text()"/>
    <xsl:template match="j:on|j:yes|tei:f/text()[.=('ON','YES')]">ON</xsl:template>
    <xsl:template match="j:off|j:no|tei:f/text()[.=('NO','OFF')]">OFF</xsl:template>

    <!-- find relevant settings links. return their xml:ids -->
    <xsl:template match="tei:link[@type='set']" as="xs:string?">
        <xsl:variable name="link-tokens" as="xs:string*" select="tokenize(@target, '\s+')"/>
        <xsl:if test="$link-tokens[1]=(concat('#start_', $id), concat('#end_', $id), concat('#', $id))">
            <xsl:sequence select="substring-after($link-tokens[2], '#')"/>
        </xsl:if>
    </xsl:template>

    <xsl:template match="text()|comment()" />

    <xsl:template match="element()">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="/">
        <xsl:variable name="links-id" as="xs:string*">
            <xsl:if test="$id">
                <xsl:apply-templates select="//tei:link[@type='set']"/>
            </xsl:if>
        </xsl:variable>
        <annotations>
            <xsl:apply-templates select="//j:settings/tei:fs[(@xml:id,@jf:id)=$links-id]"/>
        </annotations>
    </xsl:template>
</xsl:stylesheet>
