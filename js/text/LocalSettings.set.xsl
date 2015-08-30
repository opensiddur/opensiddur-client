<!-- set the local document settings (j:settings/tei:fs[@type='opensiddur:local']) 

    input:
    <settings>
        <setting>
            <name/><value/>
        </setting>
        ...
    </settings>

    Copyright 2015 Efraim Feinstein, efraim@opensiddur.org
    Licensed under the GNU Lesser General Public License, version 3 or later
-->
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0"
    xmlns:jf="http://jewishliturgy.org/ns/jlptei/flat/1.0"
    version="2.0"
    exclude-result-prefixes="#all">
    <xsl:param name="settings" as="document-node(element(settings))"/>

    <xsl:variable name="settings-fs" as="element(tei:fs)">
        <xsl:apply-templates select="$settings"/>
    </xsl:variable>

    <xsl:template match="settings">
        <tei:fs type="opensiddur:local" xml:id="opensiddur_local_settings">
            <xsl:apply-templates/>
        </tei:fs>
    </xsl:template>

    <xsl:template match="setting[name][value]">
        <tei:f name="{name}">
            <xsl:choose>
                <xsl:when test="value='ON'">
                    <j:on/>
                </xsl:when>
                <xsl:when test="value='OFF'">
                    <j:off/>
                </xsl:when>
                <xsl:when test="value='YES'">
                    <j:yes/>
                </xsl:when>
                <xsl:when test="value='NO'">
                    <j:no/>
                </xsl:when>
                <xsl:when test="value='MAYBE'">
                    <j:maybe/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="value"/>
                </xsl:otherwise>
            </xsl:choose>
        </tei:f>
    </xsl:template>

    <xsl:template match="j:settings">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:sequence select="$settings-fs"/>
            <xsl:apply-templates select="* except tei:fs[@type='opensiddur:local']"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="tei:TEI">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates select="tei:teiHeader"/>
            <xsl:if test="empty(j:settings)">
                <j:settings>
                    <xsl:sequence select="$settings-fs"/>
                </j:settings>
            </xsl:if>
            <xsl:apply-templates select="* except tei:teiHeader"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="*">
        <xsl:copy copy-namespaces="no">
            <xsl:sequence select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="text()|comment()">
        <xsl:copy/>
    </xsl:template>
</xsl:stylesheet>

