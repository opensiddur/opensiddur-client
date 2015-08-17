<!--
    set the active annotations at a given id/idrange; if no id is given, the id of the stream is assumed

    The format is the same as the format from ActiveAnnotations.get.xsl

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    version="2.0"
    exclude-result-prefixes="#all">
    <!-- filter that it must begin|end at an id, {id}, start_{id} or end_{id} -->
    <xsl:param name="id" as="xs:string?" select="(//j:streamText|//jf:merged)/(@xml:id|@jf:id)/string()"/>
    <xsl:param name="annotations" as="document-node(element(annotations))?"/>

    <xsl:variable name="settings-id" as="xs:string*">
        <xsl:apply-templates select="//tei:link[@type='set']" mode="get-annotations"/>
    </xsl:variable>

    <xsl:function name="j:clean-id">
        <xsl:param name="i" as="xs:string"/>
        <xsl:sequence select="replace($i, 'range|[(),]', '_')"/>
    </xsl:function>

    <!-- remove existing settings -->
    <xsl:template match="j:settings/tei:fs[@xml:id=$settings-id]"/>
    <xsl:template match="tei:link[@type='set'][tokenize(@target, '\s+')[1]=$id]"/>

    <xsl:template match="j:settings">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
            <xsl:apply-templates select="$annotations"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="j:links">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
            <xsl:if test="exists($annotations/annotations/annotation)">
                <tei:link type="set" target="#{id} #annotation_{j:clean-id($id)}"/>
            </xsl:if>
        </xsl:copy>

    </xsl:templates>

    <!-- find relevant settings links. return their xml:ids -->
    <xsl:template match="tei:link[@type='set']" as="xs:string?" mode="get-annotations">
        <xsl:variable name="link-tokens" as="xs:string*" select="tokenize(@target, '\s+')"/>
        <xsl:if test="$link-tokens[1]=$id">
            <xsl:sequence select="substring-after($link-tokens[2], '#')"/>
        </xsl:if>
    </xsl:template>

    <xsl:template match="element()">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="annotations">
        <tei:fs xml:id="annotation_{j:clean-id($id)}" type="opensiddur:annotation">
            <xsl:apply-templates/>
        </tei:fs>
    <xsl:template>

    <xsl:template match="annotation">
        <tei:f name="{name}">
            <xsl:choose>
                <xsl:when test="upper-case(value)='ON'"><j:on/></xsl:when>
                <xsl:otherwise><j:off/></xsl:otherwise>
            </xsl:choose>
        </tei:f>
    </xsl:template>
</xsl:stylesheet>
