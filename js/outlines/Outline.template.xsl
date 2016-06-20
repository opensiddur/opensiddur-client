<!-- template flattened outline 

  <template>
    <lang/>
    <license/>
    <source/>
    <sourceTitle/>
  </template>

  Open Siddur Project
  Created: 2016 by Efraim Feinstein, efraim@opensiddur.org
  Licensed under Creative Commons Zero, version 1.0, http://creativecommons.org/publicdomain/zero/1.0
-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ol="http://jewishliturgy.org/ns/outline/1.0"
  version="2.0">
  <xsl:template match="template">
    <ol:outline>
      <ol:source><xsl:sequence select="replace(source/string(), '^(/exist/restxq/api)', '')"/></ol:source>
      <ol:license><xsl:sequence select="license/string()"/></ol:license>
      <ol:title><xsl:sequence select="sourceTitle/string()"/></ol:title>
      <ol:lang><xsl:sequence select="lang/string()"/></ol:lang>
      <ol:item level="1">
        <ol:title></ol:title>
        <ol:from>1</ol:from>
        <ol:to>2</ol:to>
      </ol:item>
    </ol:outline>
  </xsl:template>
</xsl:stylesheet>
