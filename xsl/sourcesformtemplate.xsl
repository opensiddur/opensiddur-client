<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:exsl="http://exslt.org/common"
    extension-element-prefixes="exsl"
    version="1.0">
    <xsl:output method="xml" indent="yes"/>

    <xsl:template match="tei:biblStruct">
        <xsl:copy>
            <xsl:copy-of select="@*"/>
            <tei:analytic>
                <xsl:copy-of select="tei:analytic/tei:title[@type='main']"/>
                <xsl:call-template name="repeat-element">
                    <xsl:with-param name="times" select="1 - count(tei:analytic/tei:title[@type='main'])"/>
                    <xsl:with-param name="element" select="tei:title"/>
                    <xsl:with-param name="attributes">
                        <xsl:attribute name="type">main</xsl:attribute>
                    </xsl:with-param>
                </xsl:call-template>
                <xsl:copy-of select="tei:analytic/tei:title[@type='sub']"/>
                <xsl:call-template name="repeat-element">
                    <xsl:with-param name="times" select="1 - count(tei:analytic/tei:title[@type='sub'])"/>
                    <xsl:with-param name="element" select="tei:title"/>
                    <xsl:with-param name="attributes">
                        <xsl:attribute name="type">sub</xsl:attribute>
                    </xsl:with-param>
                </xsl:call-template>
            </tei:analytic>
            <tei:monogr>
            </tei:monogr>
            <tei:series>
            </tei:series>
            <tei:idno><xsl:value-of select="tei:idno"/></tei:idno>
            <tei:note type="copyright"><xsl:apply-templates select="tei:note[@type='copyright']"/></tei:note>
            <tei:relatedItem 
                target="{tei:relatedItem/@target}" 
                targetPattern="{tei:relatedItem/@targetPattern}"></tei:relatedItem>
        </xsl:copy>
    </xsl:template>

    <xsl:template name="repeat-element">
        <xsl:param name="times"/>
        <xsl:param name="element"/>
        <xsl:param name="attributes"/>
        <xsl:if test="$times > 0">
            <xsl:element name="{$element}">
                <xsl:copy-of select="$attributes"/>
            </xsl:element>
            <xsl:call-template name="repeat-element">
                <xsl:with-param name="times" select="$times - 1"/>
                <xsl:with-param name="element" select="$element"/>
            </xsl:call-template>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>
