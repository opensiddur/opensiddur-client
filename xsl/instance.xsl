<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"  
    version="1.0">
    <xsl:output method="xml" indent="yes"/>

    <!-- where the data model is stored in the JavaScript scope -->
    <xsl:param name="model-scope" />
    <xsl:variable name="model"><xsl:value-of select="concat($model-scope, substring('.', 1, string-length($model-scope)))"/></xsl:variable>

    <!-- mode=json-path: convert to a json path -->
    <xsl:template match="text()" mode="json-path">
        <xsl:variable name="parent-path"><xsl:apply-templates select=".." mode="json-path"/></xsl:variable>
        <xsl:variable name="norm" select="normalize-space($parent-path)"/>
        <xsl:value-of select="concat($norm, '.__text')"/>
    </xsl:template>
    
    <xsl:template match="@*" mode="json-path">
        <xsl:variable name="parent-path"><xsl:apply-templates select=".." mode="json-path"/></xsl:variable>
        <xsl:variable name="norm" select="normalize-space($parent-path)"/>
        <xsl:value-of select="concat($norm, '._', local-name(.))"/>
    </xsl:template>

    <xsl:template match="*" mode="json-path">
        <xsl:variable name="parent-path"><xsl:apply-templates select="parent::*" mode="json-path"/></xsl:variable>
        <xsl:variable name="norm" select="normalize-space($parent-path)"/>
        <xsl:value-of select="concat(substring($model, 1, number(not(parent::*)) * string-length($model)), $norm, substring('.', 1, 1 * string-length($norm)), local-name(.), '_asArray[', count(preceding-sibling::*[local-name(.)=local-name(current())]), ']')"/>
    </xsl:template>

    <xsl:template match="text()[not(following-sibling::*|preceding-sibling::*)]">
        <xsl:variable name="path"><xsl:apply-templates select="." mode="json-path"/></xsl:variable>
        <xsl:value-of select="concat('{{', $path, '}}')"/>
    </xsl:template>
    <xsl:template match="*[not(node())]">
        <xsl:variable name="path"><xsl:apply-templates select="." mode="json-path"/></xsl:variable>
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <xsl:value-of select="concat('{{', $path, '}}')"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="@*">
        <xsl:attribute name="{name()}">
            <xsl:variable name="path"><xsl:apply-templates select="." mode="json-path"/></xsl:variable>
            <xsl:value-of select="concat('{{',$path, '}}')"/>
        </xsl:attribute>
    </xsl:template>

    <xsl:template match="*|/*">
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates />
        </xsl:copy>
    </xsl:template> 

</xsl:stylesheet>
