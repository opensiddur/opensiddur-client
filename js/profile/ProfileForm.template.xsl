<xsl:stylesheet 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:tei="http://www.tei-c.org/ns/1.0"
  xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"  
  version="1.0">
  <xsl:output method="xml" indent="yes"/>
  
  <xsl:template name="address-form">
    <xsl:param name="base" select="."/>
    <tei:address>
      <xsl:copy-of select="$base/tei:address/tei:addrLine"/>
      <xsl:call-template name="add-addrLine">
        <xsl:with-param name="n" select="5 - count($base/tei:address/tei:addrLine)"/>
      </xsl:call-template>
    </tei:address>
  </xsl:template>
  
  <!-- add an address line up to n times --> 
  <xsl:template name="add-addrLine">
    <xsl:param name="n" select="0"/>
    <xsl:if test="$n > 0">
      <tei:addrLine/>
      <xsl:call-template name="add-addrLine">
        <xsl:with-param name="n" select="$n - 1"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template> 
 
  <xsl:template match="j:contributor">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
      <xsl:if test="not(@xml:lang)">
        <xsl:attribute name="xml:lang"/>
      </xsl:if>
      
      <!-- idno is required by the schema, nothing else is -->
      <xsl:copy-of select="tei:idno"/>
      <!-- name and orgName are mutually exclusive; both are needed in the form -->
      <tei:name><xsl:copy-of select="tei:name/node()"/></tei:name>
      <tei:orgName><xsl:copy-of select="tei:orgName/node()"/></tei:orgName>
      <tei:email><xsl:value-of select="tei:email"/></tei:email>
      <xsl:call-template name="address-form"/>
      <tei:affiliation>
        <tei:orgName><xsl:copy-of select="tei:affiliation/tei:orgName/node()"/></tei:orgName>
        <xsl:call-template name="address-form">
          <xsl:with-param name="base" select="tei:affiliation"/>
        </xsl:call-template>
        <tei:ptr type="url" target="{tei:affiliation/tei:ptr/@target}"/>
      </tei:affiliation>
      <tei:ptr type="url" target="{tei:ptr/@target}"/>
    </xsl:copy>
  </xsl:template>    
</xsl:stylesheet>
