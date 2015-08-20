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
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    version="2.0"
    exclude-result-prefixes="#all">
    <!-- filter that it must begin|end at an id, {id}, start_{id} or end_{id} -->
    <xsl:param name="id" as="xs:string?" select="(//j:streamText|//jf:merged)/(@xml:id|@jf:id)/string()"/>
    <xsl:param name="annotations" as="document-node(element(annotations))?"/>

    <!-- list of jf:id's of tei:fs elements that are set for $id -->
    <xsl:variable name="settings-id" as="xs:string*">
        <xsl:apply-templates select="//tei:link[@type='set']" mode="get-annotations"/>
    </xsl:variable>

    <xsl:function name="j:clean-id">
        <xsl:param name="i" as="xs:string"/>
        <xsl:sequence select="replace($i, 'range|[(),]', '_')"/>
    </xsl:function>

    <!-- remove existing settings:
        warning: this should only remove existing *annotation* settings -->
    <xsl:template match="j:settings/tei:fs[@type='opensiddur:annotation'][(@xml:id, @jf:id)=$settings-id]"/>
    <xsl:template match="tei:link[@type='set'][substring-after(tokenize(@target, '\s+')[2], '#')=$settings-id]"/>

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
                <tei:link type="set" target="#{$id} #annotation_{j:clean-id($id)}"/>
            </xsl:if>
        </xsl:copy>

    </xsl:template>

    <!-- find relevant settings links. return their xml:ids -->
    <xsl:template match="tei:link[@type='set']" as="xs:string?" mode="get-annotations">
        <xsl:variable name="link-tokens" as="xs:string*" select="tokenize(@target, '\s+')"/>
        <xsl:variable name="link-target" select="substring-after($link-tokens[2], '#')"/>
        <xsl:if test="$link-tokens[1]=concat('#', $id) and //tei:fs[@type='opensiddur:annotation'][(@jf:id,@xml:id)=$link-target]">
            <xsl:sequence select="$link-target"/>
        </xsl:if>
    </xsl:template>

    <xsl:template match="jf:merged[@jf:id=$id]">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@* except @jf:set"/>
            <xsl:attribute name="jf:set" select="string-join((
                concat('#annotation_',j:clean-id($id)),
                tokenize(@jf:set, '\s+')[not(substring-after(., '#')=$settings-id)] 
                ), ' ')"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:TEI">
        <xsl:variable name="has-settings" select="exists($annotations/annotations/annotation)"/>
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates select="tei:teiHeader"/>
            <xsl:if test="empty(j:settings) and $has-settings">
                <j:settings>
                    <xsl:apply-templates select="$annotations"/>
                </j:settings>
            </xsl:if>
            <xsl:apply-templates select="j:settings"/>
            <xsl:if test="empty(j:links) and $has-settings">
                <j:links>
                    <tei:link type="set" target="#{$id} #annotation_{j:clean-id($id)}"/>
                </j:links>
            </xsl:if>
            <xsl:apply-templates select="j:links"/>
            <xsl:apply-templates select="* except (tei:teiHeader, j:settings, j:links)"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="element()">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="annotations">
        <xsl:variable name="annotation" as="element(tei:f)*">
            <xsl:apply-templates/>
        </xsl:variable>
        <xsl:if test="exists($annotation)">
            <tei:fs jf:id="annotation_{j:clean-id($id)}" type="opensiddur:annotation">
                <xsl:sequence select="$annotation"/>
            </tei:fs>
        </xsl:if>
    </xsl:template>

    <!-- match an annotation to a feature if the annotation has a name -->
    <xsl:template match="annotation[name]">
        <tei:f name="{name}">
            <xsl:choose>
                <xsl:when test="upper-case(state)='ON'"><j:on/></xsl:when>
                <xsl:otherwise><j:off/></xsl:otherwise>
            </xsl:choose>
        </tei:f>
    </xsl:template>
</xsl:stylesheet>
