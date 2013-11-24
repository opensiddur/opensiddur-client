<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"  
    version="1.0">
    <xsl:output method="xml" indent="yes"/>
  
    <xsl:param name="default-lang">en</xsl:param>

    <xsl:template name="multi-form-repeat">
        <xsl:param name="element"/>
        <xsl:param name="max"/>

        <xsl:if test="$max > 0">
            <xsl:copy-of select="$element"/>
            <xsl:call-template name="multi-form-repeat">
                <xsl:with-param name="element" select="$element"/>
                <xsl:with-param name="max" select="$max - 1"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

    <xsl:template name="multi-form-template">
        <xsl:param name="base" />
        <xsl:param name="max" select="5"/>
        <xsl:param name="n" select="count($base)"/>
        <xsl:param name="element"/>
    
        <xsl:copy-of select="$base"/>
        <xsl:call-template name="multi-form-repeat">
            <xsl:with-param name="element" select="$element"/>
            <xsl:with-param name="max" select="$max - $n"/>
        </xsl:call-template>
    </xsl:template>
  
    <xsl:template name="present-or-default">
        <xsl:param name="present"/>
        <xsl:param name="default"/>
        <xsl:choose>
            <!-- hmmm... why does $present require normalize-space() to work? -->
            <xsl:when test="normalize-space($present)">
                <xsl:copy-of select="$present"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy-of select="$default"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="title-block">
        <xsl:param name="base"/>
        <xsl:param name="max" select="10"/>
        <xsl:call-template name="present-or-default">
            <xsl:with-param name="present"> 
                <xsl:for-each select="$base/tei:title[@type='main' or not(@type)]">
                    <xsl:copy>
                        <xsl:copy-of select="@*"/>
                        <xsl:if test="not(@type)">
                            <xsl:attribute name="type">main</xsl:attribute>
                        </xsl:if>
                        <xsl:copy-of select="node()"/>
                    </xsl:copy>
                </xsl:for-each>
            </xsl:with-param>
            <xsl:with-param name="default">
                <tei:title xml:lang="{$default-lang}" type="main"></tei:title>
            </xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="present-or-default">
            <xsl:with-param name="present" select="$base/tei:title[@type='sub']"/>
            <xsl:with-param name="default">
                <tei:title xml:lang="{$default-lang}" type="sub"></tei:title>
            </xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="present-or-default">
            <xsl:with-param name="present" select="$base/tei:title[@type='alt-main']"/>
            <xsl:with-param name="default">
                <tei:title xml:lang="{$default-lang}" type="alt-main"></tei:title>
            </xsl:with-param>
        </xsl:call-template>
        <xsl:call-template name="present-or-default">
            <xsl:with-param name="present" select="$base/tei:title[@type='alt-sub']"/>
            <xsl:with-param name="default">
                <tei:title xml:lang="{$default-lang}" type="alt-sub"></tei:title>
            </xsl:with-param>
        </xsl:call-template>
    </xsl:template>

    <xsl:template name="author-editor-block">
        <xsl:param name="base" />
        <xsl:param name="max" select="10"/>
        <xsl:param name="author" select="true()"/>
        <xsl:param name="editor" select="true()"/>
        <xsl:if test="$author">
            <xsl:call-template name="multi-form-template">
                <xsl:with-param name="base" select="$base/tei:author"/>
                <xsl:with-param name="max" select="$max"/>
                <xsl:with-param name="n" select="count($base/tei:author)"/>
                <xsl:with-param name="element">
                    <tei:author><tei:name/></tei:author>
                </xsl:with-param>
            </xsl:call-template>
        </xsl:if>
        <xsl:if test="$editor">
            <xsl:call-template name="multi-form-template">
                <xsl:with-param name="base" select="$base/tei:editor"/>
                <xsl:with-param name="max" select="$max"/>
                <xsl:with-param name="n" select="count(tei:editor)"/>
                <xsl:with-param name="element">
                    <tei:editor><tei:name/></tei:editor>
                </xsl:with-param>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>

    <!-- make a template for an existing tei:biblScope -->
    <xsl:template match="tei:biblScope">
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <xsl:if test="not(@from)">
                <xsl:attribute name="from"/>
            </xsl:if>
            <xsl:if test="not(@to)">
                <xsl:attribute name="to"/>
            </xsl:if>
            <xsl:if test="not(@unit)">
                <xsl:attribute name="unit"/>
            </xsl:if>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:relatedItem">
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <xsl:if test="not(@type)">
                <xsl:attribute name="type">scan</xsl:attribute>
            </xsl:if>
            <xsl:if test="not(@target)">
                <xsl:attribute name="target"/>
            </xsl:if>
            <xsl:if test="not(@targetPattern)">
                <xsl:attribute name="targetPattern"/>
            </xsl:if>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:biblStruct">
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <xsl:if test="not(@xml:lang)">
                <xsl:attribute name="xml:lang"><xsl:value-of select="$default-lang"/></xsl:attribute>
            </xsl:if>
            <!-- we will support a single analytic level, one monogr level, and one series -->
            <tei:analytic>
                <xsl:call-template name="title-block">
                    <xsl:with-param name="base" select="tei:analytic"/> 
                </xsl:call-template>
                <xsl:call-template name="author-editor-block">
                    <xsl:with-param name="base" select="tei:analytic"/> 
                </xsl:call-template>
            </tei:analytic>
            <tei:monogr>
                <xsl:call-template name="title-block">
                    <xsl:with-param name="base" select="tei:monogr"/> 
                </xsl:call-template>
                <xsl:call-template name="author-editor-block">
                    <xsl:with-param name="base" select="tei:monogr"/> 
                </xsl:call-template>
                <xsl:call-template name="present-or-default">
                    <xsl:with-param name="present" select="tei:monogr/tei:edition"/>
                    <xsl:with-param name="default"><tei:edition/></xsl:with-param>
                </xsl:call-template>
                <tei:imprint>
                    <xsl:call-template name="present-or-default">
                        <xsl:with-param name="present" select="tei:monogr/tei:imprint/tei:publisher"/>
                        <xsl:with-param name="default"><tei:publisher/></xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="present-or-default">
                        <xsl:with-param name="present" select="tei:monogr/tei:imprint/tei:pubPlace"/>
                        <xsl:with-param name="default"><tei:pubPlace/></xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="present-or-default">
                        <xsl:with-param name="present" select="tei:monogr/tei:imprint/tei:date"/>
                        <xsl:with-param name="default"><tei:date/></xsl:with-param>
                    </xsl:call-template>
                    <xsl:call-template name="present-or-default">
                        <xsl:with-param name="present" select="tei:monogr/tei:imprint/tei:distributor"/>
                        <xsl:with-param name="default"><tei:distributor/></xsl:with-param>
                    </xsl:call-template>
                </tei:imprint>
                <xsl:call-template name="present-or-default">
                    <xsl:with-param name="present" select="tei:monogr/tei:extent"/>
                    <xsl:with-param name="default"><tei:extent/></xsl:with-param>
                </xsl:call-template>
                <xsl:call-template name="present-or-default">
                    <xsl:with-param name="present"><xsl:apply-templates select="tei:monogr/tei:biblScope"/></xsl:with-param>
                    <xsl:with-param name="default"><tei:biblScope from="" to="" unit=""/></xsl:with-param>
                </xsl:call-template>
            </tei:monogr>
            <tei:series>
                <xsl:call-template name="title-block">
                    <xsl:with-param name="base" select="tei:series"/> 
                </xsl:call-template>
                <xsl:call-template name="author-editor-block">
                    <xsl:with-param name="base" select="tei:series"/> 
                    <xsl:with-param name="author" select="false()"/>
                </xsl:call-template>
            </tei:series>
            <xsl:call-template name="present-or-default">
                <xsl:with-param name="present" select="tei:note[@type='copyright']"/>
                <!-- copyright note containing both the notice and a link to the license -->
                <xsl:with-param name="default">
                    <tei:note type="copyright">
                        <tei:note/>
                        <tei:ref type="url" target=""/>
                    </tei:note>
                </xsl:with-param>
            </xsl:call-template>
            <xsl:call-template name="present-or-default">
                <xsl:with-param name="present"><xsl:apply-templates select="tei:relatedItem"/></xsl:with-param>
                <xsl:with-param name="default">
                    <tei:relatedItem type="scan" target="" targetPattern=""/>
                </xsl:with-param>
            </xsl:call-template>
        </xsl:copy>
    </xsl:template>    
</xsl:stylesheet>
