<!-- Get commit messages in a JSON-ready format

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0"
    >

    <xsl:template match="tei:revisionDesc">
        <changes>
            <xsl:apply-templates select="tei:change"/>
        </changes>
    </xsl:template>

    <xsl:template match="tei:change">
        <xsl:if test="string(@when)">
            <change>
                <type><xsl:value-of select="@type"/></type>
                <who><xsl:value-of select="replace(@who, '/user/', '')"/></who>
                <when>
                    <date><xsl:value-of select="format-dateTime(xs:dateTime(@when), '[Y0001]-[M01]-[D01]')"/></date>
                    <time><xsl:value-of select="format-dateTime(xs:dateTime(@when), '[H01]:[m01]:[s01]')"/></time>
                </when>
                <message><xsl:value-of select="."/></message>
            </change>
        </xsl:if>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="//tei:revisionDesc"/>
    </xsl:template>
</xsl:stylesheet>
