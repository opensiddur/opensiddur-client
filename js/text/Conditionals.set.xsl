<!--
    set a conditional

    <conditional>{conditional XML}</conditional>

    Open Siddur Project
    Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    xmlns:local="http://jewishliturgy.org/ns/functions/xslt"
    version="2.0"
    exclude-result-prefixes="#all">
    <!-- conditional -->
    <xsl:param name="conditional" as="document-node(element(conditionals))"/>

    <xsl:variable name="ids" as="xs:string+" select="$conditional/conditionals/conditional/@id/string()"/>

    <xsl:template match="j:conditions">
      <xsl:copy copy-namespaces="no">
        <xsl:sequence select="@*"/>
        <xsl:apply-templates select="$conditional"/>
        <xsl:apply-templates select="* except *[(@jf:id,@xml:id)=$ids]"/>
      </xsl:copy>
    </xsl:template>

    <xsl:template match="conditionals">
      <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="conditional">
      <j:condition jf:id="{@id}">
        <xsl:apply-templates/>
      </j:condition>
    </xsl:template>

    <xsl:template match="tei:TEI">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates select="tei:teiHeader"/>
            <xsl:if test="exists($conditional/*/conditional/*) and empty(j:conditions)">
              <j:conditions>
                <xsl:apply-templates select="$conditional"/>
              </j:conditions>
            </xsl:if>
            <xsl:apply-templates select="* except (tei:teiHeader)"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*">
      <xsl:copy copy-namespaces="no">
        <xsl:sequence select="@*"/>
        <xsl:apply-templates/>
      </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
