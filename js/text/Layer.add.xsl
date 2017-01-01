<!-- add a layer if one of the same type does not already exist

    Open Siddur Project
    Copyright 2015-2016 Efraim Feinstein, efraim@opensiddur.org
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
    <xsl:param name="resource" as="xs:string"/>
    <xsl:param name="layer-id" as="xs:string?"/>

    <xsl:template name="add-layer">
        <xsl:variable name="lid" select="($layer-id, concat('layer-', $layer-type))[1]"/>
        <jf:layer type="{$layer-type}" 
            jf:id="{$lid}"
            jf:layer-id="{$resource}#{$lid}"/>
    </xsl:template>

    <xsl:template match="jf:concurrent">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
            <xsl:if test="not(jf:layer[@type=$layer-type]) or
                ($layer-id and not(jf:layer[ends-with(@jf:layer-id, concat('#', $layer-id))]))">
                <xsl:call-template name="add-layer"/>
            </xsl:if>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:text">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
            <xsl:if test="not(jf:concurrent)">
                <jf:concurrent>
                    <xsl:call-template name="add-layer"/>
                </jf:concurrent>
            </xsl:if>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*|comment()|text()">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>
    
</xsl:stylesheet>
