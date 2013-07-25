<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0" 
    xmlns="http://www.w3.org/1999/xhtml"
    version="1.0">
    <xsl:output method="xml" indent="yes"/>

    <xsl:template match="@xml:lang">
        <xsl:copy-of select="."/>
    </xsl:template>

    <xsl:template match="@lang|@class"/>

    <xsl:template name="underscored-to-namespaced-name">
        <xsl:param name="string" as="xs:string"/>

        <xsl:variable name="no-data">
            <xsl:choose>
                <xsl:when test="starts-with($string, 'data-')">
                    <xsl:value-of select="substring-after($string, 'data-')" />
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$string"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="pre-prefix" select="substring-before($no-data, '-')"/>
        <xsl:variable name="prefix">
            <xsl:if test="$pre-prefix='xml' or $pre-prefix='tei' or $pre-prefix='jf' or $pre-prefix='j'">
                <xsl:value-of select="$pre-prefix"/>
            </xsl:if>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$prefix != ''">
                <xsl:value-of select="concat($prefix, ':', substring-after($no-data, concat($prefix, '-')))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$no-data"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="@*[starts-with(name(.), 'data-')]">
        <xsl:variable name="name">
            <xsl:call-template name="underscored-to-namespaced-name">
                <xsl:with-param name="string" select="name(.)"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:attribute name="{$name}">
            <xsl:value-of select="."/>
        </xsl:attribute>
    </xsl:template>

    <xsl:template match="*">
        <xsl:variable name="element-name">
            <xsl:call-template name="underscored-to-namespaced-name">
                <xsl:with-param name="string" select="@class"/>
            </xsl:call-template>
        </xsl:variable>
            
        <xsl:element name="{$element-name}">
            <xsl:apply-templates select="@*|node()"/>
        </xsl:element>
    </xsl:template>
</xsl:stylesheet>

