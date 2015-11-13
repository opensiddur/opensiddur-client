<!--
    Extract a single note from a context

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns="http://www.w3.org/1999/xhtml"
    version="2.0"
    exclude-result-prefixes="#all">
    <xsl:import href="FlatToEditingHtml.xsl"/>

    <xsl:param name="id" as="xs:string"/>

    <xsl:template match="tei:ref">
        <a class="tei-ref">
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates/>
        </a>
    </xsl:template>

    <xsl:template match="*">
        <div class="{replace(name(), ':', '-')}">
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="tei:TEI">
        <xsl:apply-templates select="id($id)"/>
    </xsl:template>
</xsl:stylesheet>
