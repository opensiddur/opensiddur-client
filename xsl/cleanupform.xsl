<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:exsl="http://exslt.org/common"
    extension-element-prefixes="exsl"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0" 
    xmlns="http://www.w3.org/1999/xhtml"
    version="1.0">
    <xsl:output method="xml" indent="yes"/>
    
    <xsl:template match="@*">
      <xsl:if test="string-length(normalize-space(.)) > 0">
        <xsl:copy-of select="."/>
      </xsl:if>
    </xsl:template>
    
    <!-- the content of a ptr or relatedItem is its target -->
    <xsl:template match="tei:ptr|tei:relatedItem">
      <xsl:if test="string-length(normalize-space(@target)) > 0">
        <xsl:copy>
          <xsl:apply-templates select="@*"/>
        </xsl:copy>
      </xsl:if>
    </xsl:template>

    <!-- the content of a biblScope is its @from|@to -->
    <xsl:template match="tei:biblScope">
      <xsl:if test="string-length(normalize-space(concat(@from, @to))) > 0">
        <xsl:copy>
          <xsl:apply-templates select="@*"/>
        </xsl:copy>
      </xsl:if>
    </xsl:template>

    <!-- reject empty elements and elements whose only children are empty -->
    <xsl:template match="*">
      <xsl:if test="text()|*">
        <xsl:variable name="transformed">
          <xsl:apply-templates />
        </xsl:variable>
        <xsl:if test="count(exsl:node-set($transformed)/node()) > 0">
          <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <xsl:copy-of select="$transformed"/>
          </xsl:copy>
        </xsl:if>
      </xsl:if>
    </xsl:template>
    
    <xsl:template match="text()">
      <xsl:variable name="txt" select="normalize-space(.)"/>
      <xsl:if test="string-length($txt) > 0">
        <xsl:value-of select="normalize-space(.)"/>
      </xsl:if>
    </xsl:template>
</xsl:stylesheet>
