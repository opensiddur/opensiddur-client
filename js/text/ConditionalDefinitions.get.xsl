<!--
    Load a conditional definition (tei:fsDecl) and convert it into a Javascript-ready format.

    Copyright 2016-2017 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0">
    <xsl:import href="Conditionals.get.xsl"/>

    <xsl:template match="tei:fsDecl">
        <definition>
            <name><xsl:sequence select="@type/string()"/></name>
            <xsl:apply-templates select="tei:fsDescr"/>
            <xsl:apply-templates select="tei:fDecl"/>
        </definition>
    </xsl:template>

    <xsl:template match="tei:fsDescr|tei:fDescr">
        <description>
            <lang><xsl:sequence select="ancestor-or-self::*[@xml:lang][1]/@xml:lang/string()"/></lang>
            <desc><xsl:sequence select="string(.)"/></desc>
        </description>
    </xsl:template>

    <xsl:template match="tei:fDecl">
        <feature>
            <name><xsl:sequence select="@name/string()"/></name>
            <xsl:apply-templates select="tei:fDescr"/>
            <xsl:apply-templates select="j:vSwitch|tei:vRange"/>

            <xsl:apply-templates select="tei:vDefault"/>
        </feature>
    </xsl:template>

    <xsl:template match="j:vSwitch">
        <type>
            <xsl:sequence select="@type/string()"/>
        </type>
    </xsl:template>

    <xsl:template match="tei:vRange">
        <type>
            <xsl:apply-templates/>
        </type>
    </xsl:template>

    <xsl:template match="tei:vRange/tei:string">
        <xsl:sequence select="'string'"/>
    </xsl:template>

    <xsl:template match="tei:vDefault[not(tei:if)]">
        <default>
            <value><xsl:apply-templates/></value>
            <expression></expression>
        </default>
    </xsl:template>

    <xsl:template match="tei:vDefault/tei:if">
        <default>
            <value><xsl:apply-templates select="tei:then/following-sibling::*[1]"/></value>
            <expression><xsl:apply-templates select="*[. &lt;&lt; current()/tei:then]"/></expression>
        </default>
    </xsl:template>

    <xsl:template match="/">
        <definitions>
            <xsl:apply-templates select="//tei:fsDecl"/>
        </definitions>
    </xsl:template>

</xsl:stylesheet>