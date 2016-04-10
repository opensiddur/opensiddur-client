<!--
    get the settings that are present at a given id.

    <settings>
        <setting>
            <type>[setting type]</type>
            <name>[setting name]</name>
            <state>YES|NO|MAYBE|ON|OFF</state>
        </setting>
    </settings>

    Open Siddur Project
    Copyright 2015-2016 Efraim Feinstein, efraim@opensiddur.org
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
    <xsl:param name="id" as="xs:string?" />

    <xsl:template match="j:settings/tei:fs">
        <xsl:apply-templates />
    </xsl:template>

    <xsl:template match="tei:f">
        <setting>
            <type><xsl:sequence select="string(../@type)"/></type>
            <name><xsl:sequence select="string(@name)"/></name>
            <state><xsl:apply-templates/></state>
        </setting>
    </xsl:template>

    <xsl:template match="tei:f/text()"/>
    <xsl:template match="j:on|j:yes|j:off|j:no|j:maybe"><xsl:sequence select="upper-case(local-name(.))"/></xsl:template>
    <xsl:template match="tei:f/text()[upper-case(.)=('NO','OFF','YES','MAYBE','ON')]"><xsl:sequence select="upper-case(.)"/></xsl:template>

    <xsl:template match="element()">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="/">
        <settings>
          <xsl:apply-templates select="for $fragment in tokenize($id, '\s+') return //j:settings/tei:fs[(@xml:id,@jf:id)=substring-after($fragment, '#')]"/>
        </settings>
    </xsl:template>
</xsl:stylesheet>
