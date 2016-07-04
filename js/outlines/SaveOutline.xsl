<!--
  Convert flat JS-style outline to db-XML

  Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
  Licensed under the GNU Lesser Public License, version 3 or later
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ol="http://jewishliturgy.org/ns/outline/1.0"
  xmlns:olx="http://jewishliturgy.org/ns/outline/responses/1.0"
  version="2.0"
  >
  <xsl:template match="ol:item">
    <xsl:variable name="this" select="."/>
    <xsl:variable name="parent" select="preceding-sibling::ol:item[@level=$this/@level - 1][1]"/>
    <xsl:copy copy-namespaces="no">
      <xsl:sequence select="@* except @level"/>
      <xsl:apply-templates select="*"/>
      <xsl:apply-templates select="following-sibling::ol:item[@level=$this/@level + 1][preceding-sibling::*[@level=$this/@level][1] is $this][1]"/>
    </xsl:copy>
    <xsl:apply-templates select="following-sibling::ol:item[@level=$this/@level][1][empty($parent) or preceding-sibling::ol:item[@level=$this/@level - 1][1] is $parent]"/>
  </xsl:template>
  
  <xsl:template match="ol:outline">
    <xsl:copy copy-namespaces="no">
      <xsl:apply-templates select="* except ol:item"/>
      <xsl:apply-templates select="ol:item[1]"/>
    </xsl:copy>
  </xsl:template>


  <xsl:template match="*">
    <xsl:copy copy-namespaces="no">
      <xsl:sequence select="@*"/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>

