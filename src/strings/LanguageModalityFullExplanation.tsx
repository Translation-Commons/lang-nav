function LanguageModalityFullExplanation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
      <div>
        What medium is language used in? Most common languages have both spoken and written
        traditions. Most languages are divided into a spoken ↔ written axis, which is divided into
        5 levels, from &quot;Written only&quot;, &quot;Mostly Written&quot;, &quot;Spoken &
        Written&quot;, &quot;Mostly Spoken&quot;, and &quot;Spoken only&quot;. Usually this is
        distinguished if there are L1 communities with strong oral and/or written traditions. Sign
        languages are separately recognized.
      </div>
      <div>
        <strong>Standard v Community Forms</strong>: Some languages have a separate standardized
        writing form (eg. Modern Standard Arabic) versus the common spoken form (eg. Sudanese Arabic
        in Sudan). Often those are distinguished as languages versus dialects but in cases like the
        Arabic variations, they are sufficiently different to be considered separate languages. The
        community languages are considered &quot;Spoken&quot; only if there is no established
        community practice of writing the language beyond transcription, linguistic documentation,
        religious texts, or occasional informal use. When there is an established written tradition
        (books, education, community publications, ...), but speakers generally prefer a different
        standardized language or variety for formal writing, the language is considered &quot;Mostly
        Spoken&quot;.
      </div>
      <div>
        <strong>Liturgical Languages</strong>: Some languages are only used in religious contexts,
        like Latin or Sanskrit. Most of these are grouped as &quot;Mostly Written&quot;.
      </div>
      <div>
        <strong>Extinct Languages</strong>: Extinct languages are hard to classify here. For
        example, Egyptian Hieroglyphics are known for their documents but during its zenith the
        glyphs were the written form of an oral language, most glyphs even have a phonetic value, so
        it is not &quot;Written&quot; only. On the other hand, some extinct languages are known by
        descriptions of the language but not written documents. Languages with only vocabularies
        collected by external observers are considered &quot;Spoken&quot; only.
      </div>
      <div>
        <strong>Revitalized Languages</strong>: Languages in revitalization projects are usually
        classified as &quot;Mostly Written&quot; because they exist in education materials but have
        no L1 communities (eg. Ainu). Some, like Hawaiian and Irish, have L1 communities and are
        considered &quot;Spoken & Written&quot;.
      </div>
      <div>
        <strong>Constructed Languages</strong>: Similar to revitalized languages, constructed
        languages like Esperanto or Klingon have few or no L1 speakers, so they are considered
        &quot;Mostly Written&quot; or only &quot;Written&quot;.
      </div>
    </div>
  );
}

export default LanguageModalityFullExplanation;
