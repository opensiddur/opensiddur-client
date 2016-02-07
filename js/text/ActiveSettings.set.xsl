<!--
    add the given settings to the j:settings section.

    <settings>
        <setting>
            <type>[setting type]</type>
            <name>[setting name]</name>
            <state>YES|NO|MAYBE|ON|OFF</state>
        </setting>
    </settings>

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
    xmlns:local="local"
    version="2.0"
    exclude-result-prefixes="#all">
    <xsl:param name="settings" as="document-node(element(settings))" />

    <xsl:function name="local:cleanup-name">
      <xsl:param name="n" as="xs:string"/>
      <xsl:sequence select="replace($n, '[^\p{L}0-9_-]+', '_')"/>
    </xsl:function>

    <xsl:function name="local:setting-id">
      <xsl:param name="setting" as="element(setting)"/>
        <xsl:sequence select="$setting/string-join((
            local:cleanup-name(type),
            local:cleanup-name(name),
            state), '_')"/>
      
    </xsl:function>

    <xsl:variable name="ids-to-edit" as="xs:string*">
      <xsl:sequence select="for $s in $settings/settings/setting return local:setting-id($s)"/>
    </xsl:variable>

    <xsl:template match="settings">
      <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="setting">
        <tei:fs type="{type}" xml:id="{local:setting-id(.)}">
            <tei:f name="{name}">
              <xsl:element name="j:{lower-case(state)}"/>
            </tei:f>
        </tei:fs>
    </xsl:template>

    <xsl:template match="tei:f/text()"/>
    <xsl:template match="j:on|j:yes|j:off|j:no|j:maybe"><xsl:sequence select="upper-case(local-name(.))"/></xsl:template>
    <xsl:template match="tei:f/text()[upper-case(.)=('NO','OFF','YES','MAYBE','ON')]"><xsl:sequence select="upper-case(.)"/></xsl:template>

    <xsl:template match="element()">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="j:settings/tei:fs[(@xml:id,@jf:id)=$ids-to-edit]"/>

    <xsl:template match="j:settings">
        <xsl:copy>
          <xsl:sequence select="@*"/>
          <xsl:apply-templates/>
          <xsl:apply-templates select="$settings/settings"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:TEI">
        <xsl:copy copy-namespaces="no">
          <xsl:sequence select="@*"/>
          <xsl:sequence select="tei:teiHeader"/>
          <xsl:apply-templates select="j:settings"/>
          <xsl:if test="empty(j:settings) and exists($settings/settings)">
            <j:settings>
              <xsl:apply-templates select="$settings"/>
            </j:settings>
          </xsl:if>
          <xsl:sequence select="* except (tei:teiHeader,j:settings)"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>

