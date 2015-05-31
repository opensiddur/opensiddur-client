<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0" 
    xmlns="http://www.w3.org/1999/xhtml"
    version="2.0">
    <xsl:output method="xml" indent="yes"/>
    
    <xsl:template match="@*" as="attribute()?">
      <xsl:if test="normalize-space(.)">
        <xsl:copy-of select="."/>
      </xsl:if>
    </xsl:template>
    
    <!-- the content of a ptr or relatedItem is its target -->
    <xsl:template match="tei:ptr|tei:relatedItem">
      <xsl:if test="normalize-space(@target)">
        <xsl:copy>
          <xsl:apply-templates select="@*"/>
        </xsl:copy>
      </xsl:if>
    </xsl:template>

    <!-- the content of a biblScope is its @from|@to -->
    <xsl:template match="tei:biblScope">
      <xsl:if test="normalize-space(concat(@from, @to))">
        <xsl:copy>
          <xsl:apply-templates select="@*"/>
        </xsl:copy>
      </xsl:if>
    </xsl:template>

    <!-- reject empty elements and elements whose only children are empty -->
    <xsl:template match="*">
      <xsl:if test="text()|*">
        <xsl:variable name="transformed" as="node()*">
          <xsl:apply-templates />
        </xsl:variable>
        <xsl:if test="count($transformed) > 0">
          <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <xsl:copy-of select="$transformed"/>
          </xsl:copy>
        </xsl:if>
      </xsl:if>
    </xsl:template>
    
    <xsl:template match="text()">
      <xsl:variable name="txt" select="normalize-space(.)"/>
      <xsl:if test="$txt">
        <xsl:value-of select="$txt"/>
      </xsl:if>
    </xsl:template>
</xsl:stylesheet>
