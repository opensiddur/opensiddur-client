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

    <xsl:template match="text()[ancestor::tei:seg][ancestor::j:streamText][not(ancestor::tei:w)][not(ancestor::tei:pc)][normalize-space(.)]">
        <xsl:variable name="context" select="."/>
		<xsl:analyze-string select="normalize-space(.)" 
            regex="(\s+)|([\p{{L}}\p{{M}}\p{{N}}\p{{S}}\p{{C}}]+)|(\p{{P}})">
			<xsl:matching-substring>
                <xsl:variable name="space-chars" select="regex-group(1)" as="xs:string"/>
				<xsl:variable name="word-chars" select="regex-group(2)" as="xs:string"/>
				<xsl:variable name="punct-chars" select="regex-group(3)" as="xs:string"/>
                <xsl:value-of select="$space-chars"/>
				<xsl:choose>
					<xsl:when test="$word-chars">
						<tei:w><xsl:call-template name="encode-special">
                            <xsl:with-param name="text" select="$word-chars"/>
                            <xsl:with-param name="context" select="$context"/>
                        </xsl:call-template></tei:w>
					</xsl:when>
					<xsl:when test="$punct-chars">
						<tei:pc><xsl:call-template name="encode-special">
                            <xsl:with-param name="text" select="$punct-chars"/>
                            <xsl:with-param name="context" select="$context"/>
                        </xsl:call-template></tei:pc>
					</xsl:when>
				</xsl:choose>
			</xsl:matching-substring>
			<xsl:non-matching-substring>
			</xsl:non-matching-substring>				
		</xsl:analyze-string>
	</xsl:template>
  
    <xsl:template name="encode-special">
        <xsl:param name="text" as="xs:string"/>
        <xsl:param name="context" select="."/>
        <!-- encode a text section with a divineName element, if required;
        also handle special cases, like yerushalayim
         -->
        <xsl:choose>
            <xsl:when test="$context/(lang('he') or lang('arc'))">

                <!-- yod, sheva?, yod, qamats -->
                <xsl:variable name="yod-yod-regex" as="xs:string"
                    select="'&#x05d9;(&#x05b0;?)&#x05d9;&#x05b8;'"/>
                <!-- yod, sheva?, he, holam?, trope? vav, (qamats|patah|hiriq), he -->
                <xsl:variable name="tetragrammaton-regex" as="xs:string"
                    select="'&#x05d9;(&#x05b0;)?&#x05d4;[&#x05b9;]?[&#x0591;-&#x05af;]?&#x05d5;[&#x05b8;&#x05b7;&#x05b4;]?&#x05d4;'"/>
                <!-- vowel, trope?, vav, dagesh?, holam -->
                <xsl:variable name="holam-haser-regex" as="xs:string"
                    select="'([&#x05b0;-&#x05bb;&#x05c7;][&#x0591;-&#x05af;]?&#x05d5;&#x05bc;?)&#x05b9;'"/>
                <!-- yod, sheva, trope?, resh, qubuts?, trope?, (vav, dagesh)?, shin, shindot, qamats, trope?, lamed,
                    (qamats | patah | meteg | cgj | hiriq)+ | ( trope? )+, finalmem 
                 -->
                <xsl:variable name="yerushalayim-regex" as="xs:string"
                    select="string-join(('(&#x05d9;&#x05b0;[&#x0591;-&#x05af;]?&#x05e8;&#x05bb;?[&#x0591;-&#x05af;]?',
                        '(&#x05d5;&#x05bc;)?&#x05e9;&#x05c1;&#x05b8;[&#x0591;-&#x05af;]?',
                        '&#x05dc;)([&#x05b8;&#x05b7;&#x05bd;&#x034f;&#x05b4;]+|([&#x0591;-&#x05af;]))+(&#x05dd;)'),'')"/>

                <xsl:variable name="dash-regex" as="xs:string" select="'-'"/>
            

                <xsl:analyze-string select="$text" 
                    regex="{string-join(('(',$yod-yod-regex,(: groups 1, 2 :)
                            ')|(',$tetragrammaton-regex,    (: groups 3-4 :)
                            ')|(',$holam-haser-regex,')|(',       (: groups 5-6 :)
                            $yerushalayim-regex, ')|(',           (: groups 7-12 :)
                            $dash-regex, ')'                      (: group 13 :) 
                            ),'')}">
                    <!--  -->
                    <xsl:matching-substring>
                        <xsl:choose>
                            <xsl:when test="regex-group(1)">
                                <j:divineName>
                                    <tei:reg>
                                        <xsl:sequence select="string-join((
                                            '&#x05d9;',
                                            regex-group(2),
                                            '&#x05d4;&#x05d5;&#x05b8;&#x05d4;'
                                            ),'')"/>
                                    </tei:reg>
                                    <tei:orig>
                                        <xsl:copy/>
                                    </tei:orig>
                                </j:divineName>
                            </xsl:when>
                            <xsl:when test="regex-group(3)">
                                <j:divineName>
                                    <xsl:copy/>
                                </j:divineName>
                            </xsl:when>
                            <xsl:when test="regex-group(5)">
                                <xsl:value-of select="string-join((regex-group(6),'&#x05ba;'),'')"/>
                            </xsl:when>
                            <xsl:when test="regex-group(7)">
                                <xsl:variable name="vowel" select="
                                    if (contains(regex-group(10),'&#x05b8;')) 
                                    then '&#x05b8;'
                                    else '&#x05b7;'"/>
                                <tei:choice>
                                    <tei:orig>
                                        <xsl:sequence select="string-join((
                                            regex-group(8),
                                            $vowel, '&#x05bd;&#x034f;&#x05b4;',
                                            regex-group(11),'&#x05dd;'
                                            ),'')"/>
                                    </tei:orig>
                                    <tei:reg>
                                        <xsl:sequence select="string-join((
                                            regex-group(8),
                                            $vowel, '&#x05bd;',
                                            regex-group(11),'&#x05d9;&#x05b4;&#x05dd;'
                                            ),'')"/>
                                    </tei:reg>
                                </tei:choice>
                            </xsl:when>
                            <xsl:when test="regex-group(13)">
                                <xsl:value-of select="'&#x05be;'"/>
                            </xsl:when> 
                            <xsl:otherwise/>
                        </xsl:choose>
                    </xsl:matching-substring>
                    <xsl:non-matching-substring>
                        <xsl:copy/>
                    </xsl:non-matching-substring>
                </xsl:analyze-string>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>  

    <xsl:template match="comment()|*">
        <xsl:copy>
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

</xsl:stylesheet>
