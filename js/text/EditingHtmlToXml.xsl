<!--
    Convert the XML with editing HTML to valid JLPTEI XML that can be saved

    Note: only streamText mode is currently supported.

    Open Siddur Project
    Copyright 2015-2016 Efraim Feinstein, efraim@opensiddur.org
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
    <!-- return true() if $class-attr (an @class) contains the class $test-class -->
    <xsl:function name="local:has-class" as="xs:boolean">
        <xsl:param name="class-attr" as="xs:string?"/>
        <xsl:param name="test-class" as="xs:string"/>
        <xsl:sequence select="tokenize($class-attr, '\s+')=$test-class"/>
    </xsl:function>

    <xsl:template match="@id|@*:id" as="attribute()" mode="#default generic">
        <xsl:attribute name="xml:id" select="."/>
    </xsl:template>
    <xsl:template match="@lang|@*:lang" as="attribute()" mode="#default generic">
        <xsl:attribute name="xml:lang" select="."/>
    </xsl:template>

    <!-- do not save attributes that are added by the client -->
    <xsl:template match="@*[starts-with(name(.), 'data-')][not(starts-with(name(.), 'data-os-'))]" as="attribute()">
        <xsl:variable name="tokens" as="xs:string*" select="tokenize(substring-after(name(.), 'data-'), '-')"/>
        <xsl:attribute 
            name="{if (count($tokens)=1) then $tokens
                   else concat($tokens[1], ':', string-join(subsequence($tokens, 2), '-'))}"
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
    <xsl:template match="html:p[local:has-class(@class, 'tei-seg') or not(@class)]" mode="streamText">
        <xsl:if test="normalize-space(.)">
            <tei:seg>
                <xsl:apply-templates select="@*" />
                <xsl:call-template name="add-xmlid">
                    <xsl:with-param name="element-name" select="'tei:seg'"/>
                </xsl:call-template>
                <xsl:apply-templates mode="streamText"/>
            </tei:seg>
        </xsl:if>
    </xsl:template>

    <!-- text under tei:seg: spacing should be normalized, but sometimes we
        should retain spaces -->
    <xsl:template match="text()[ancestor::html:p[not(@class) or local:has-class(@class, 'tei-seg')]]" mode="streamText">
        <xsl:sequence select="normalize-space(.)"/>
    </xsl:template>


    <!-- html:p[@class~tei-ptr] -> tei:ptr -->
    <xsl:template match="html:p[local:has-class(@class, 'tei-ptr')]" mode="streamText">
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
    <xsl:template match="html:a[@href][local:has-class(@class, 'tei-ref')]" mode="streamText">
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

    <!-- html:p(tei-item) -->
    <!-- html:p -> leave an anchor -->
    <!-- html:div(jf:annotation) -->
    <!-- html:p(jf:set) -->
    <!-- html:div(jf:conditional) -->
    <xsl:template match="html:p[local:has-class(@class,'tei-item')]|
            html:div[local:has-class(@class, 'tei-div')]|
            html:div[local:has-class(@class, 'tei-l')]|
            html:p[local:has-class(@class,'tei-p')]|
            html:div[local:has-class(@class, 'jf-annotation')]|
            html:p[local:has-class(@class, 'jf-set')]|
            html:div[local:has-class(@class, 'jf-conditional')]"
        mode="streamText">
        <tei:anchor>
            <xsl:variable name="classes" select="tokenize(@class, '\s+')"/>
            <xsl:attribute name="xml:id" select="@id"/>
        </tei:anchor>
    </xsl:template>

    <xsl:template match="jf:merged" mode="layer">
        <xsl:param name="layer-type" as="xs:string"/>
        <xsl:param name="layer-id" as="xs:string"/>
        <xsl:variable name="layer-content" as ="element()*">
            <xsl:for-each-group
                select="*"
                group-starting-with="*[local:has-class(@class, $layer-type)][local:has-class(@class, 'start')][@data-jf-layer-id=$layer-id]"
                >
                <xsl:variable name="starting-element" select="current-group()[1]"/>
                <xsl:if test="local:has-class($starting-element/@class, $layer-type) and @data-jf-layer-id=$layer-id">
                    <xsl:if test="$layer-type='layer-div'">
                        <!-- header -->
                        <xsl:apply-templates select="$starting-element/*" mode="layer"/>
                    </xsl:if>
                    <xsl:element name="{
                        if ($layer-type='layer-lg') then 'tei:l'
                        else if ($layer-type='layer-p') then 'tei:p'
                        else if ($layer-type='layer-list') then 'tei:item'
                        else if ($layer-type='layer-div') then 'tei:ab'
                        else 'j:unknown'}">
                        <xsl:if test="$layer-type='layer-lg' and $starting-element/@data-jf-lg-start">
                            <xsl:attribute name="jf:lg-start" select="'1'"/>
                        </xsl:if>
                        <tei:ptr target="#range({$starting-element/@id},{replace($starting-element/@id, '^start_', 'end_')})">
                        </tei:ptr>
                    </xsl:element>
                </xsl:if>
            </xsl:for-each-group>
        </xsl:variable>
        <xsl:if test="exists($layer-content)">
            <xsl:choose>
                <!-- some layers need special processing -->
                <xsl:when test="$layer-type='layer-div'">
                    <tei:div>
                        <xsl:sequence select="$layer-content"/>
                    </tei:div>
                </xsl:when>
                <xsl:when test="$layer-type='layer-list'">
                    <tei:list>
                        <xsl:sequence select="$layer-content"/>
                    </tei:list>
                </xsl:when>
                <xsl:when test="$layer-type='layer-lg'">
                    <xsl:for-each-group select="$layer-content" group-starting-with="*[@jf:lg-start]">
                        <tei:lg>
                            <xsl:for-each select="current-group()">
                                <xsl:copy copy-namespaces="no">
                                    <xsl:sequence select="@* except @jf:lg-start"/>
                                    <xsl:sequence select="node()"/>
                                </xsl:copy>
                            </xsl:for-each>
                        </tei:lg>
                    </xsl:for-each-group>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:sequence select="$layer-content"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:if>
    </xsl:template>

    <xsl:template match="html:h1[local:has-class(@class, 'tei-head')]" mode="layer">
        <tei:head>
            <xsl:apply-templates select="@id|@lang"/>
            <xsl:apply-templates/>
        </tei:head>
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
              <xsl:with-param name="layer-id" as="xs:string" select="substring-after(@jf:layer-id, '#')"/>
          </xsl:apply-templates>
        </xsl:variable>
        <xsl:if test="exists($layer-content)">
          <j:layer>
              <xsl:apply-templates select="@* except @type"/>
              <xsl:sequence select="@type"/>
              <xsl:sequence select="$layer-content"/>
          </j:layer>
        </xsl:if>
    </xsl:template>

    <!-- links mode: find streamtext elements that should become links and make them links,
        preserve other links; if all links have been removed, remove the j:links element  -->
    <xsl:template match="j:links">
        <xsl:variable name="link-content" as="element(tei:link)*">
            <xsl:apply-templates select="//jf:merged" mode="links"/>
        </xsl:variable>
        <xsl:if test="exists($link-content)">
            <xsl:copy copy-namespaces="no">
                <xsl:apply-templates select="@*" mode="generic"/>
                <xsl:sequence select="$link-content"/>
            </xsl:copy>
        </xsl:if>
    </xsl:template>

    <xsl:template match="html:div[local:has-class(@class, 'jf-annotation')][starts-with(@id, 'start_')]" mode="links">
        <xsl:variable name="local-annotation-resource" as="xs:string" 
            select="concat('/data/notes/', normalize-space(//j:settings/tei:fs[@type='opensiddur:local']/tei:f[@name='local-annotation-resource']))"/>
        <xsl:variable name="resource" select="tokenize(@data-jf-annotation, '#')[1]"/>
    <!-- when a target attribute has a blank annotation pointer, it should be repointed to the local annotation resource -->
        <xsl:variable name="id" select="html:div[local:has-class(@class, 'tei-note')]/@id/string()"/>
        <tei:link target="#range({@id},{replace(@id, '^start_', 'end_')}) {
            if ($resource='/data/notes/') then $local-annotation-resource else $resource
            }#{$id}">
            <xsl:variable name="note-type" as="xs:string" select="html:div[local:has-class(@class, 'tei-note')]/@data-type"/>
            <xsl:attribute name="type" select="
                    if ($note-type='instruction') 
                    then 'instruction' 
                    else if ($note-type=('comment', 'editorial', 'inline', 'transcription', 'translation')) 
                    then 'note' 
                    else 'annotation'"/>
        </tei:link>
    </xsl:template>

    <xsl:template match="html:p[local:has-class(@class, 'jf-set')][starts-with(@id, 'start_')]" mode="links">
      <xsl:variable name="target" select="concat('#range(',@id,',', replace(@id, '^start_', 'end_') ,')')"/>
      <xsl:for-each select="tokenize(@data-jf-set, '\s+')">
        <tei:link type="set" target="{$target} {.}"/>
      </xsl:for-each>
    </xsl:template>
    
    <xsl:template match="html:div[local:has-class(@class, 'jf-conditional')][starts-with(@id, 'start_')]" mode="links">
      <xsl:variable name="target" select="concat('#range(',@id,',', replace(@id, '^start_', 'end_') ,')')"/>
      <!-- partial preparation for conditional-instruction support -->
      <xsl:variable name="instruction" as="xs:string?">
        <!-- copied code from annotation to find where the annotation resource is -->
        <xsl:if test="@data-jf-conditional-instruction">
          <xsl:variable name="local-annotation-resource" as="xs:string" 
              select="concat('/data/notes/', normalize-space(//j:settings/tei:fs[@type='opensiddur:local']/tei:f[@name='local-annotation-resource']))"/>
          <xsl:variable name="resource" select="tokenize(@data-jf-conditional-instruction, '#')[1]"/>
          <xsl:variable name="id" select="html:div[local:has-class(@class, 'tei-note')]/@id/string()"/>
          <xsl:sequence select="string-join((if ($resource='/data/notes/') then $local-annotation-resource else $resource, '#', $id), '')"/>
        </xsl:if>
      </xsl:variable>
      <xsl:for-each select="tokenize(@data-jf-conditional, '\s+')">
        <tei:link type="condition" target="{string-join(($target, . , $instruction), ' ')}"/>
      </xsl:for-each>
    </xsl:template>

    <xsl:template match="*|text()" mode="links">
        <xsl:apply-templates mode="#current"/>
    </xsl:template>

    <!-- condition-ids mode: find which condition jf:ids are required to be preserved -->
    <xsl:template match="html:div[local:has-class(@class, 'jf-conditional')]" mode="condition-ids" as="xs:string*">
      <xsl:sequence select="for $token in tokenize(@data-jf-conditional, '\s+')
          return substring-after($token, '#')"/>
    </xsl:template>
    <xsl:template match="text()|comment()" mode="condition-ids"/>

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
            <!-- conditions are rewritten each time
              (1) extract which conditions are required by jf:id
              (2) copy only conditions whose ids match the required ones
             -->
            <xsl:variable name="condition-ids" as="xs:string*">
              <xsl:apply-templates select="//jf:merged" mode="condition-ids"/>
            </xsl:variable>
            <xsl:if test="exists($condition-ids)">
              <j:conditions>
                <xsl:apply-templates select="//j:conditions/j:condition[@jf:id=$condition-ids]"/>
              </j:conditions>
            </xsl:if>
            <xsl:apply-templates select="* except (tei:teiHeader,j:conditions)"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:*|j:*">
        <xsl:copy copy-namespaces="no">
            <xsl:apply-templates select="@*" mode="generic"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet> 
