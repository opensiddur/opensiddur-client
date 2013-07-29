<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns="http://www.w3.org/1999/xhtml"
    version="1.0">
    <xsl:output method="xml" indent="yes"/>

    <xsl:template name="make-name">
      <xsl:param name="string"/>
      <xsl:choose>
        <xsl:when test="contains($string, ':')">
          <xsl:value-of select="concat(substring-before($string, ':'), '-', substring-after($string, ':'))"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$string"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:template>

    <xsl:template match="@xml:lang">
        <xsl:copy-of select="."/>
        <xsl:attribute name="lang">
          <xsl:value-of select="."/>
        </xsl:attribute>
    </xsl:template>

    <xsl:template match="@*">
        <xsl:variable name="attr-name">
          <xsl:call-template name="make-name">
            <xsl:with-param name="string" select="name()"/>
          </xsl:call-template>
        </xsl:variable>
        <xsl:attribute name="data-{$attr-name}">
          <xsl:value-of select="."/>
        </xsl:attribute>
    </xsl:template>

    <xsl:template match="*">
        <xsl:variable name="elem-name">
          <xsl:call-template name="make-name">
            <xsl:with-param name="string" select="name()"/>
          </xsl:call-template>
        </xsl:variable>
        <div class="{$elem-name}">
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates select="node()"/>
        </div>
    </xsl:template>
</xsl:stylesheet>
