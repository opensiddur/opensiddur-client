<!-- Isolate titles to make them easily processed into JSON

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0"
    >

    <xsl:template match="tei:titleStmt">
        <titles>
            <xsl:for-each-group select="tei:title" group-starting-with="tei:title[@type=('main', 'alt') or not(@type)]">
                <xsl:variable name="this-title" select="current-group()[1]"/>
                <xsl:variable name="this-subtitle" select="current-group()[2]"/>
                <title>
                    <lang><xsl:sequence select="$this-title/ancestor-or-self::*[@xml:lang][1]/@xml:lang/string()"/></lang>
                    <text><xsl:sequence select="$this-title/node()"/></text>
                    <subLang><xsl:sequence select="$this-subtitle/ancestor-or-self::*[@xml:lang][1]/@xml:lang/string()"/></subLang>
                    <subText><xsl:sequence select="$this-subtitle/node()"/></subText>
                </title>
            </xsl:for-each-group>
        </titles>
    </xsl:template>


    <xsl:template match="/">
        <xsl:apply-templates select="//tei:titleStmt"/>
    </xsl:template>
    
</xsl:stylesheet>
