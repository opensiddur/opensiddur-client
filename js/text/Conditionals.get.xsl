<!--
  Get the conditionals from the given (fragment) pointers
  Return as a string
  Copyright 2016 Efraim Feinstein, efraim@opensiddur.org
  Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    version="2.0"
    exclude-result-prefixes="#all">
  <xsl:param name="ptrs" as="xs:string"/>

  <xsl:template match="j:condition|tei:fs">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="tei:f" as="xs:string">
    <xsl:variable name="type" as="xs:string" select="parent::tei:fs/@type/string()"/>
    <xsl:variable name="value" as="xs:string+">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:sequence select="string-join((
      $type, '$', @name/string(), '=', $value
      ), '')"/>
  </xsl:template>

  <xsl:template match="j:yes|j:no|j:on|j:off|j:maybe">
    <xsl:sequence select="upper-case(local-name())"/>
  </xsl:template>

  <xsl:template match="tei:f/text()[.]" priority="10">
    <xsl:sequence select="normalize-space(.)"/>
  </xsl:template>

  <xsl:template match="j:any|j:all|j:oneOf">
    <xsl:variable name="operator" select="upper-case(local-name())"/>
    <xsl:variable name="evaluated" as="xs:string+">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:sequence select="string-join((
      $operator, '(',
      string-join($evaluated, ', '), 
      ')'
      ), '')"/>
  </xsl:template>

  <xsl:template match="j:not">
    <xsl:variable name="evaluated" as="xs:string">
      <xsl:apply-templates/>
    </xsl:variable>
    <xsl:sequence select="string-join(('NOT(', $evaluated, ')'), '')" />
  </xsl:template>

  <xsl:template match="/">
    <xsl:variable name="ptr-destination" select="substring-after(., '#')"/>
    <conditional>
      <xsl:apply-templates select="
        for $ptr-destination in tokenize($ptrs, '\s+')
        return .//j:conditions/*[(@jf:id,@xml:id)=substring-after($ptr-destination, '#')]
        "/>
    </conditional>
  </xsl:template>

  <xsl:template match="text()|comment()"/>
</xsl:stylesheet>
