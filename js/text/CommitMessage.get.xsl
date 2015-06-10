<!-- Get commit message

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0"
    >
    <!-- the first tei:change element is always the editable one -->
    <xsl:template match="tei:change">
        <message><xsl:value-of select="normalize-space(.)"/></message>
    </xsl:template>

    <xsl:template match="/">
        <xsl:apply-templates select="//tei:change[1]"/>
    </xsl:template>
    
</xsl:stylesheet>
