<!--
    Isolate annotations
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
    <xsl:import href="EditingHtmlToXml.xsl"/>

    <xsl:template match="html:div[contains(@class, 'jf-annotation')][contains(@class, 'start')]">
        <jf:annotation 
            resource="{substring-before(@data-jf-annotation, '#')}" 
            id="{substring-after(@data-jf-annotation, '#')}">
            <xsl:apply-templates mode="streamText" select="html:div[contains(@class, 'tei-note')]"/>
        </jf:annotation>
    </xsl:template>

    <xsl:template match="/">
        <jf:allAnnotations>
            <xsl:variable name="isolated-annotations" as="element(jf:annotation)*">
                <xsl:apply-templates select="//html:div[contains(@class, 'jf-annotation')][contains(@class, 'start')]"/>
            </xsl:variable>
            <xsl:message><xsl:sequence select="$isolated-annotations"/></xsl:message>
            <xsl:for-each-group 
                select="$isolated-annotations"
                group-by="@resource">
                <jf:annotationResource resource="{current-grouping-key()}">
                    <!-- take the first instance of each changed annotation within the resource -->
                    <xsl:for-each-group select="current-group()" group-by="@id">
                        <xsl:sequence select="current-group()[1]"/>
                    </xsl:for-each-group>
                </jf:annotationResource>
            </xsl:for-each-group>
        </jf:allAnnotations>
    </xsl:template> 
</xsl:stylesheet>
