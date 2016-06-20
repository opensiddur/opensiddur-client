<!--
  Load outline XML so it can be converted to Javascript

  Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
  Licensed under the GNU Lesser Public License, version 3 or later
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ol="http://jewishliturgy.org/ns/outline/1.0"
  xmlns:olx="http://jewishliturgy.org/ns/outline/responses/1.0"
  version="2.0"
  >
  <!-- change items to a flat structure where the hierarchical level is declared -->
  <xsl:template match="ol:item">
    <xsl:copy copy-namespaces="no">
      <xsl:sequence select="@*"/>
      <xsl:attribute name="level" select="count(ancestor::*)"/>
      <xsl:apply-templates select="* except ol:item"/>
    </xsl:copy>
    <xsl:apply-templates select="ol:item"/>
  </xsl:template>

  <xsl:template match="*">
    <xsl:copy copy-namespaces="no">
      <xsl:sequence select="@*"/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>
