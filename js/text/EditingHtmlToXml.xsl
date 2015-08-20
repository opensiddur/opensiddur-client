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

    <!-- do not save attributes that are added by the client -->
    <xsl:template match="@*[starts-with(name(.), 'data-')][not(starts-with(name(.), 'data-os-'))]" as="attribute()">
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

    <!-- p -> tei:seg 
    when p lacks a class, it is considered a segment because magicline inserts p[not(@class)]
    -->
    <xsl:template match="html:p[contains(@class, 'tei-seg') or not(@class)][normalize-space(.)]" mode="streamText">
        <tei:seg>
            <xsl:apply-templates select="@*" />
            <xsl:call-template name="add-xmlid">
                <xsl:with-param name="element-name" select="'tei:seg'"/>
            </xsl:call-template>
            <xsl:apply-templates mode="streamText"/>
        </tei:seg>
    </xsl:template>

    <!-- html:a[@href] -> tei:ptr -->
    <xsl:template match="html:a[@href][contains(@class, 'tei-ptr')]" mode="streamText">
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

    <!-- html:a -> tei:ref -->
    <xsl:template match="html:a[@href][contains(@class, 'tei-ref')]" mode="streamText">
        <tei:ref>
            <xsl:apply-templates select="@*[not(name(.)=('data-target-base', 'data-target-fragment'))]"/>
            <!-- @href contains /texts/[name], @data-target-base/@data-target-fragment contain the pointer -->
            <xsl:attribute name="target" 
                select="concat('/data/original/', @data-target-base, @data-target-fragment)"/>
            <xsl:call-template name="add-xmlid"> 
                <xsl:with-param name="element-name" select="'tei:ref'"/>
            </xsl:call-template>
            <xsl:apply-templates mode="#current"/>
        </tei:ref>
    </xsl:template>

    <!-- html:p -> leave an anchor -->
    <!-- html:div(jf:annotation) -->
    <xsl:template match="html:p[contains(@class,'tei-p')]|html:div[contains(@class, 'jf-annotation')]" 
        mode="streamText">
        <tei:anchor>
            <xsl:variable name="classes" select="tokenize(@class, '\s+')"/>
            <xsl:attribute name="xml:id" select="@id"/>
        </tei:anchor>
    </xsl:template>

    <xsl:template match="jf:merged" mode="layer">
        <xsl:param name="layer-type" as="xs:string"/>
        <xsl:for-each-group 
            select="*"
            group-starting-with="*[contains(@class, $layer-type)][contains(@class, 'start')]"
            >
            <xsl:variable name="starting-element" select="current-group()[1]"/>
            <xsl:element name="{if ($layer-type='layer-p') then 'tei:p' else 'j:unknown'}">
                <tei:ptr target="#range({$starting-element/@id},{replace($starting-element/@id, '^start_', 'end_')})">
                </tei:ptr>
            </xsl:element>
        </xsl:for-each-group>
    </xsl:template>
 
    <xsl:template match="jf:concurrent">
        <xsl:variable name="layers" as="element(j:layer)*">
            <xsl:apply-templates select="jf:layer"/>
        </xsl:variable>
        <xsl:if test="exists($layers)">
            <j:concurrent>
                <xsl:apply-templates select="@*"/>
                <xsl:sequence select="$layers"/>
            </j:concurrent>
        </xsl:if>
    </xsl:template>

    <xsl:template match="jf:layer[not(starts-with(@type, 'phony-'))]">
        <xsl:variable name="layer-content" as="element()*">
          <xsl:apply-templates select="//jf:merged" mode="layer">
              <xsl:with-param name="layer-type" as="xs:string" select="concat('layer-',@type)"/>
          </xsl:apply-templates>
        </xsl:variable>
        <xsl:if test="exists($layer-content)">
          <j:layer>
              <xsl:apply-templates select="@*"/>
              <xsl:sequence select="@type"/>
              <xsl:sequence select="$layer-content"/>
          </j:layer>
        </xsl:if>
    </xsl:template>

    <!-- links mode: find streamtext elements that should become links and make them links,
        preserve other links  -->
    <xsl:template match="j:links">
        <xsl:copy copy-namespaces="no">
            <xsl:apply-templates select="@*" mode="generic"/>
            <xsl:apply-templates select="//jf:merged" mode="links"/>
            <xsl:apply-templates select="tei:link[@type='set']"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="html:div[contains(@class, 'jf-annotation')][starts-with(@id, 'start_')]" mode="links">
        <xsl:variable name="resource" select="tokenize(@data-jf-annotation, '#')[1]"/>
        <xsl:variable name="id" select="html:div[contains(@class, 'tei-note')]/@id/string()"/>
        <tei:link target="#range({@id},{replace(@id, '^start_', 'end_')}) {$resource}#{$id}">
            <xsl:variable name="note-type" as="xs:string" select="html:div[contains(@class, 'tei-note')]/@data-type"/>
            <xsl:attribute name="type" select="
                    if ($note-type='instruction') 
                    then 'instruction' 
                    else if ($note-type=('comment', 'editorial', 'inline', 'transcription', 'translation')) 
                    then 'note' 
                    else 'annotation'"/>
        </tei:link>
    </xsl:template>

    <xsl:template match="*|text()" mode="links">
        <xsl:apply-templates mode="#current"/>
    </xsl:template>

    <xsl:template match="tei:TEI">
        <xsl:copy copy-namespaces="no">
            <xsl:apply-templates select="@*" mode="generic"/>
            <xsl:apply-templates select="tei:teiHeader"/>
            <!-- if there are any annotations, make sure we have a links element --> 
            <xsl:if test="not(j:links)">
                <xsl:variable name="all-links" as="element(tei:link)*">
                    <xsl:apply-templates select="//jf:merged" mode="links"/>
                </xsl:variable>
                <xsl:if test="exists($all-links)">
                    <j:links>
                        <xsl:sequence select="$all-links"/>
                    </j:links>
                </xsl:if>
            </xsl:if>
            <xsl:apply-templates select="* except tei:teiHeader"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:*|j:*">
        <xsl:copy copy-namespaces="no">
            <xsl:apply-templates select="@*" mode="generic"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet> 
