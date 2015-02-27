<!--
    Convert the XML with editing HTML to valid JLPTEI XML that can be saved

    Note: only streamText mode is currently supported.

    Open Siddur Project
    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:local="local"
    version="2.0"
    exclude-result-prefixes="#all"
    >
    <xsl:template match="@id|@*:id" as="attribute()" mode="#default generic">
        <xsl:attribute name="xml:id" select="."/>
    </xsl:template>
    <xsl:template match="@lang|@*:lang" as="attribute()" mode="#default generic">
        <xsl:attribute name="xml:lang" select="."/>
    </xsl:template>

    <xsl:template match="@*[starts-with(name(.), 'data-')]" as="attribute()">
        <xsl:attribute 
            name="{replace(substring-after(name(.), 'data-'), '-', ':')}"
            select="."/>
    </xsl:template>

    <xsl:template match="@*"/>
    <xsl:template match="@*" mode="generic">
        <xsl:sequence select="."/>
    </xsl:template>

    <xsl:template match="jf:merged">
        <j:streamText>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates mode="streamText"/>
        </j:streamText>
    </xsl:template>

    <xsl:template name="add-xmlid" as="attribute()?">
        <xsl:param name="element-name" as="xs:string"/>
        <!-- add a randomly generated xml:id -->
        <xsl:if test="not(@id)">
            <xsl:attribute name="xml:id" select="concat(substring-after($element-name, ':'), '_', generate-id(.))"/>
        </xsl:if>
    </xsl:template>

    <xsl:template match="*" mode="streamText">
        <xsl:variable name="classes" select="tokenize(@class, '\s+')"/>
        <xsl:variable name="element-class" select="
            $classes[substring-before(., '-')=('tei','j')]"/>
        <xsl:variable name="element-name" select="replace($element-class, '-', ':')"/>
        <xsl:if test="$element-class"> <!-- CKEditor sometimes adds spurious p tags -->
            <xsl:element name="{$element-name}">
                <xsl:apply-templates select="@*" />
                <xsl:call-template name="add-xmlid">
                    <xsl:with-param name="element-name" select="$element-name"/>
                </xsl:call-template>
                <xsl:apply-templates mode="streamText"/>
            </xsl:element>
        </xsl:if>
    </xsl:template>

    <!-- p -> tei:seg -->
    <xsl:template match="html:p[normalize-space(.)]" mode="streamText">
        <tei:seg>
            <xsl:apply-templates select="@*" />
            <xsl:call-template name="add-xmlid">
                <xsl:with-param name="element-name" select="'tei:seg'"/>
            </xsl:call-template>
            <xsl:apply-templates mode="streamText"/>
        </tei:seg>
    </xsl:template>

    <!-- html:a[@href] -> tei:ptr -->
    <xsl:template match="html:a[@href]" mode="streamText">
        <tei:ptr>
            <xsl:apply-templates select="@*[not(name(.)=('data-target-base', 'data-target-fragment'))]"/>
            <!-- @href contains /texts/[name], @data-target-base/@data-target-fragment contain the pointer -->
            <xsl:attribute name="target" 
                select="concat('/data/original/', @data-target-base, @data-target-fragment)"/>
            <xsl:call-template name="add-xmlid"> 
                <xsl:with-param name="element-name" select="'tei:ptr'"/>
            </xsl:call-template>
        </tei:ptr>
    </xsl:template>

    <!-- html:a[@id] -> leave an anchor -->
    <xsl:template match="html:a" mode="streamText">
        <tei:anchor>
            <xsl:variable name="classes" select="tokenize(@class, '\s+')"/>
            <xsl:attribute name="xml:id" select="
                if ($classes='start')
                then concat('start_', @id)
                else if ($classes='end')
                then concat('end_', substring-after(@id, '_end_'))
                else @id
            "/>
        </tei:anchor>
    </xsl:template>
    
    <xsl:template match="jf:concurrent">
        <j:concurrent>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates/>
        </j:concurrent>
    </xsl:template>

    <xsl:template match="jf:layer">
        <j:layer>
            <xsl:apply-templates select="@*"/>
            <xsl:sequence select="@type"/>
            <xsl:apply-templates select="//jf:merged/*" mode="layer">
                <xsl:with-param name="layer-type" as="xs:string" select="concat('layer-',@type)"/>
            </xsl:apply-templates>
        </j:layer>
    </xsl:template>

    <xsl:template match="tei:*|j:*">
        <xsl:copy copy-namespaces="no">
            <xsl:apply-templates select="@*" mode="generic"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet> 
