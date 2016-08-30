<!-- get a list of layer ids

    <layers>
        <layer>...</layer>
    </layers>

    Open Siddur Project
    Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0"
    >
    <xsl:param name="layer-type" as="xs:string"/>

    <xsl:template match="jf:layer[@type=$layer-type]">
        <layer><xsl:sequence select="substring-after(@jf:layer-id, '#')"/></layer>
    </xsl:template>

    <xsl:template match="/">
        <layers>
            <xsl:apply-templates select="//jf:layer[@type=$layer-type]"/>
        </layers>
    </xsl:template>

</xsl:stylesheet>
