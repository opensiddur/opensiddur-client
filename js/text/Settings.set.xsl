<!--
    get a given setting

    <settings>
        <setting-name> - name must be able to be made into an element name!
        </setting-name>
    </settings>

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:local="http://jewishliturgy.org/ns/functions/xslt"
    version="2.0"
    exclude-result-prefixes="#all">
    <!-- setting name -->
    <xsl:param name="setting-type" as="xs:string?"/>
    <!-- feature name -->
    <xsl:param name="feature-name" as="xs:string?"/>

    <!-- filter that it must begin|end at an id, {id}, start_{id} or end_{id} -->
    <xsl:param name="id" as="xs:string?"/>

    <xsl:function name="local:cleanup-feature-name" as="xs:string">
        <xsl:param name="feature-name" as="xs:string"/>

        <xsl:sequence select="replace($feature-name, '[:]', '-')"/>
    </xsl:function>

    <xsl:template match="j:settings/tei:fs[empty($setting-type) or @type=$setting-type]|
        tei:f[empty($feature-name) or @name=$feature-name]">
        <xsl:element name="{local:cleanup-feature-name(@type)}">
            <xsl:apply-templates />
        </xsl:element>
    </xsl:template>

    <xsl:template match="tei:f/*|tei:f/text()">
        <value>
            <xsl:sequence select="string(.)"/>
        </value>
    </xsl:template>

    <!-- find relevant settings links. return their xml:ids -->
    <xsl:template match="tei:link[@type='set']" as="xs:string?">
        <xsl:variable name="link-tokens" as="xs:string*" select="tokenize(@target, '\s+')"/>
        <xsl:if test="$link-tokens[1]=(concat('start_', $id), concat('end_', $id), $id)">
            <xsl:sequence select="substring-after($link-tokens[2], '#')"/>
        </xsl:if>
    </xsl:template>

    <xsl:template match="text()|comment()" />

    <xsl:template match="element()">
        <xsl:apply-templates/>
    </xsl:template>

    <xsl:template match="/">
        <xsl:variable name="links-id" as="xs:string*">
            <xsl:if test="$id">
                <xsl:apply-templates select="//tei:link[@type='set']"/>
            </xsl:if>
        </xsl:variable>
        <settings>
            <xsl:apply-templates select="//j:settings/tei:fs[@xml:id=$links-id]"/>
        </settings>
    </xsl:template>
</xsl:stylesheet>
