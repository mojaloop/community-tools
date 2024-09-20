<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:bom="http://cyclonedx.org/schema/bom/1.4">
    <xsl:output method="text" />

    <xsl:template match="/">

        <xsl:text>dependency&#10;</xsl:text>

        <!-- Use the namespace prefix in the XPath expression -->
        <xsl:for-each select="//bom:dependency">
            <xsl:value-of select="@ref"/>
            <xsl:text>&#10;</xsl:text>
        </xsl:for-each>
    </xsl:template>

</xsl:stylesheet>