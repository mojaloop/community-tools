<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:bom="http://cyclonedx.org/schema/bom/1.6">
    <xsl:output method="text" />

    <xsl:template match="/">
        <xsl:text>dependency&#10;</xsl:text>

        <xsl:for-each select="//bom:dependency">
            <xsl:variable name="rawRef" select="@ref"/>

            <!-- Remove 'npm:' if it exists -->
            <xsl:variable name="noNpm" select="concat(substring-before($rawRef, 'npm:'), substring-after($rawRef, 'npm:'))"/>

            <!-- Remove suffix like [hash] by cutting at the first space -->
            <xsl:choose>
                <xsl:when test="contains($noNpm, ' ')">
                    <xsl:value-of select="substring-before($noNpm, ' ')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$noNpm"/>
                </xsl:otherwise>
            </xsl:choose>

            <xsl:text>&#10;</xsl:text>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>
