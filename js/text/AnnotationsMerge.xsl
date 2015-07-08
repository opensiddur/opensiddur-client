<!--
    Merge annotations with an existing file
 
    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    version="2.0"
    exclude-result-prefixes="#all"
    >
    <xsl:param name="annotations" as="element(jf:annotationResource)"/>
    
    <!-- replace a note if it's in the $annotations block -->
    <xsl:template match="tei:note">
        <xsl:choose>
            <xsl:when test="@xml:id=$annotations/jf:annotation/@id">
                <xsl:sequence select="$annotations/jf:annotation[@id=current()/@xml:id]/tei:note"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:sequence select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <!-- add any notes that are in the $annotations block but are not identified in the file -->
    <xsl:template match="j:annotations">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
            <xsl:sequence select="$annotations/jf:annotation[not(@id=current()/tei:note/@xml:id)]/tei:note"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>

