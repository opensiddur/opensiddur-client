<!--
    Convert the streamText part of the output of /api/data/original/*/flat to
    the most convenient form of HTML for editing

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
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:local="local"
    version="2.0"
    exclude-result-prefixes="#all"
    >
    <xsl:variable name="span-elements" as="xs:string+" select="(
        'tei:c', 'tei:label', 'tei:pc', 'tei:w', 
        'j:divineName'
    )"/>

    <xsl:function name="local:element-name" as="xs:string">
        <xsl:param name="context" as="element()"/>

        <xsl:sequence select="
            if ($context/name()='tei:seg')
            then 'p'
            else if ($context/name()='tei:ptr')
            then 'a'
            else if ($context/name()='tei:head')
            then 'h1'
            else if ($context/name()=$span-elements)
            then 'span'
            else 'div'"/>
    </xsl:function>

    <xsl:function name="local:layer-lookup" as="xs:string">
        <xsl:param name="context" as="element()"/>
        
        <xsl:sequence select="root($context)//jf:concurrent/jf:layer[@jf:layer-id=$context/@jf:layer-id]/@type/string()"/>
    </xsl:function>

    <xsl:template name="class-attribute" as="attribute()*">
        <xsl:attribute name="class" select="string-join(('layer', concat('layer-',local:layer-lookup(.)), 
            if (@jf:start) then 'start' else if (@jf:end) then 'end' else (), 
            replace(name(), ':', '-')), ' ')"/>
    </xsl:template>

    <!-- elements -->
    <xsl:template match="*[@jf:start]">
        <p id="start_{@jf:start}">  <!-- id has to conform to the client expectations -->
            <xsl:apply-templates select="@* except @jf:start"/>
            <xsl:call-template name="class-attribute"/>
            <xsl:apply-templates select="following-sibling::*[1][not(@jf:start|@jf:end)][@jf:layer-id=current()/@jf:layer-id]"
                mode="in-a"/>
            <xsl:apply-templates select="." mode="filler"/>
        </p>
    </xsl:template>

    <xsl:template match="*[@jf:end]">
        <p id="end_{@jf:end}">
            <xsl:apply-templates select="@* except @jf:end"/>
            <xsl:call-template name="class-attribute"/>
            <xsl:apply-templates select="." mode="filler"/>
        </p>
    </xsl:template>

    <xsl:template match="*[@jf:layer-id][not(@jf:start|@jf:end)]"/>
    <xsl:template match="*[@jf:layer-id][not(@jf:start|@jf:end)]" mode="in-a">
        <xsl:message>mode in-a: <xsl:value-of select="name()"/></xsl:message>
        <xsl:apply-templates select="." mode="in-a-process"/>
        <xsl:apply-templates select="following-sibling::*[1][not(@jf:start|@jf:end)][@jf:layer-id=current()/@jf:layer-id]" mode="#current"/>
    </xsl:template>
    
    <!-- the presence of internal anchors are causing some issue with the widget system;
    removing all anchors for now; when they are supported, this bug will have to be fixed    
     -->
    <xsl:template match="tei:anchor"/>

<!--
    <xsl:template match="tei:anchor">
        <a>
            <xsl:apply-templates select="@*"/>
            <xsl:attribute name="class" select="replace(name(), ':', '-')"/>
        </a>
    </xsl:template>
-->
    <!-- special anchors from layers formed by the client. These are not needed -->
    <xsl:template match="tei:anchor[starts-with(@jf:id,'start_') or starts-with(@jf:id,'end_')]"/>

    <xsl:template match="*" mode="#default in-a-process">
        <xsl:element name="{local:element-name(.)}">
            <xsl:apply-templates select="@*"/>
            <xsl:attribute name="class" select="replace(name(), ':', '-')"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="tei:ptr" mode="#default in-a-process">
        <a class="tei-ptr">
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates/>
            <xsl:sequence select="concat('Include: ', tokenize(@target, '/')[last()])"/>
        </a>
    </xsl:template>

    <!-- filler text so widgets will show up -->
    <xsl:template match="tei:p[@jf:start]" mode="filler">
        <xsl:text>&#182;&#x21d3;</xsl:text>
    </xsl:template>
    <xsl:template match="tei:p[@jf:end]" mode="filler">
        <xsl:text>&#x21d1;&#182;</xsl:text>
    </xsl:template>

    <!-- attributes -->
    <xsl:template match="@target">
        <xsl:variable name="target-base" select="
            for $s in replace(., '/data/original/', '')
            return 
                if (contains($s, '#')) then substring-before($s, '#')
                else $s"/>
        <xsl:variable name="target-fragment" select="concat('#', substring-after(.,'#'))"/>
        <xsl:attribute name="href" select="if ($target-base) then concat('/texts/', $target-base) else '#'"/>
        <xsl:attribute name="target" select="'_blank'"/>
        <!-- not sure if this is the right way to do it... -->
        <xsl:attribute name="data-target-base" select="$target-base"/>
        <xsl:attribute name="data-target-fragment" select="$target-fragment"/>
    </xsl:template>

    <xsl:template match="@n">
        <xsl:attribute name="title" select="."/>
    </xsl:template>

    <xsl:template match="@*:id" >
        <xsl:attribute name="id" select="."/>
    </xsl:template>

    <xsl:template match="@*:lang">
        <xsl:attribute name="lang" select="."/>
    </xsl:template>

    <xsl:template match="@*:stream|@*:layer-id"/>

    <xsl:template match="@*">
        <xsl:attribute name="data-{replace(name(), ':', '-')}" select="."/>
    </xsl:template>

    <!-- these will become inconsistent if allowed to coexist with the merged section -->
    <xsl:template match="j:links"/>

    <!-- resource-level parts that will not become inconsistent -->
    <xsl:template match="tei:teiHeader|j:conditions|j:settings">
        <xsl:sequence select="."/>
    </xsl:template>

    <!-- pass-through -->
    <xsl:template match="tei:TEI|tei:text|jf:concurrent/descendant-or-self::*|jf:merged">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>
