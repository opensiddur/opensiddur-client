<!-- return the local document settings (j:settings/tei:fs[@type='opensiddur:local']) 

    <settings>
        <setting>
            <name/><value/>
        </setting>
        ...
    </settings>

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

    <xsl:template match="j:settings/tei:fs[@type='opensiddur:local']">
        <settings>
            <xsl:apply-templates/>
        </settings>
    </xsl:template>

    <xsl:template match="tei:f">
        <setting>
            <name><xsl:sequence select="string(@name)"/></name>
            <value><xsl:apply-templates/></value>
        </setting>
    </xsl:template>

    <xsl:template match="tei:f/text()|tei:string|tei:numeric">
        <xsl:sequence select="normalize-space(string(.))"/>
    </xsl:template>

    <xsl:template match="j:on|j:off|j:yes|j:no|j:maybe">
        <xsl:sequence select="upper-case(local-name(.))"/>
    </xsl:template>

    <xsl:template match="*">
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="text()|comment()"/>

    <xsl:template match="/">
        <xsl:choose>
            <xsl:when test="//j:settings/tei:fs[@type='opensiddur:local']">
                <xsl:apply-templates select="//j:settings/tei:fs[@type='opensiddur:local']"/>
            </xsl:when>
            <xsl:otherwise>
                <settings/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
