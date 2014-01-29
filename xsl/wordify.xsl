<!--
    turn segments into word-separated entities, where required

    Open Siddur Project
    Copyright 2014 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    version="2.0"
    >
    <xsl:output method="xml" indent="yes"/>

    <xsl:template match="text()[ancestor::tei:seg][ancestor::j:streamText][not(ancestor::tei:w)][normalize-space(.)]">
		<xsl:analyze-string select="." regex="(\s+)|([\p{{L}}\p{{M}}\p{{N}}\p{{S}}\p{{C}}]+)|(\p{{P}})">
			<xsl:matching-substring>
                <xsl:variable name="space-chars" select="regex-group(1)" as="xs:string"/>
				<xsl:variable name="word-chars" select="regex-group(2)" as="xs:string"/>
				<xsl:variable name="punct-chars" select="regex-group(3)" as="xs:string"/>
                <xsl:value-of select="$space-chars"/>
				<xsl:choose>
					<xsl:when test="$word-chars">
						<tei:w><xsl:value-of select="$word-chars"/></tei:w>
					</xsl:when>
					<xsl:when test="$punct-chars">
						<tei:pc><xsl:value-of select="$punct-chars"/></tei:pc>
					</xsl:when>
				</xsl:choose>
			</xsl:matching-substring>
			<xsl:non-matching-substring>
			</xsl:non-matching-substring>				
		</xsl:analyze-string>
	</xsl:template>

    <xsl:template match="comment()|*">
        <xsl:copy>
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>
