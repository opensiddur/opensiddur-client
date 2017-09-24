<!-- Save a conditionals document from the conditional definitions service
    The input is the conditionals document, a parameter contains the

    Open Siddur Project
    Copyright 2017 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet version="2.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:ixsl="http://saxonica.com/ns/interactiveXSLT"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:tei="http://www.tei-c.org/ns/1.0"
                xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0">
    <xsl:param name="new-definitions" as="document-node(element(tei:fsdDecl))"/>

    <xsl:template match="tei:fsdDecl">
        <xsl:sequence select="$new-definitions"/>
    </xsl:template>

    <!-- insert a blank change element, which will be filled in on post -->
    <xsl:template match="tei:revisionDesc">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <tei:change/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <!-- almost everything is a copy -->
    <xsl:template match="*|comment()">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>