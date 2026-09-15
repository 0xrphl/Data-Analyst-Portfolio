import React, { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

function Tex({ children, block = false }) {
  const html = useMemo(
    () => katex.renderToString(children, { displayMode: block, throwOnError: false, strict: false }),
    [children, block],
  )
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

function renderInline(text) {
  if (!text) return ''
  return text.replace(/\$([^$]+)\$/g, (_, m) => {
    try {
      return katex.renderToString(m.trim(), { displayMode: false, throwOnError: false, strict: false })
    } catch {
      return m
    }
  })
}

const S = {
  panel: {
    height: '100%', overflowY: 'auto', padding: '18px 20px',
    fontSize: 13.5, lineHeight: 1.7, color: '#c8cfe8',
  },
  h: {
    color: '#fff', fontSize: 15, margin: '22px 0 8px', fontWeight: 600,
    borderBottom: '1px solid #1e2338', paddingBottom: 4,
  },
  h1: { color: '#fff', fontSize: 18, marginBottom: 12, fontWeight: 700 },
  eq: {
    display: 'block', textAlign: 'center', margin: '12px 0',
    overflowX: 'auto', padding: '6px 0',
  },
  mainEq: {
    display: 'block', textAlign: 'center', margin: '16px 0', padding: '10px 8px',
    background: '#11142a', border: '1px solid #2a3152', borderRadius: 8, overflowX: 'auto',
  },
  p: { marginBottom: 6 },
  list: { paddingLeft: 18, marginBottom: 8 },
}

function DerivationSection({ section }) {
  if (section.type === 'heading') return <div style={S.h1}>{section.title}</div>
  if (section.type === 'list') {
    return (
      <ul style={S.list}>
        {section.items.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
        ))}
      </ul>
    )
  }
  if (section.type === 'mainEq') {
    return (
      <>
        <span style={S.mainEq}><Tex block>{section.equation}</Tex></span>
        {section.after && <p style={S.p} dangerouslySetInnerHTML={{ __html: renderInline(section.after) }} />}
      </>
    )
  }
  return (
    <>
      {section.title && <div style={S.h}>{section.title}</div>}
      {section.content && <p style={S.p} dangerouslySetInnerHTML={{ __html: renderInline(section.content) }} />}
      {section.equation && <span style={S.eq}><Tex block>{section.equation}</Tex></span>}
      {section.after && <p style={S.p} dangerouslySetInnerHTML={{ __html: renderInline(section.after) }} />}
      {section.equation2 && <span style={S.eq}><Tex block>{section.equation2}</Tex></span>}
      {section.after2 && <p style={S.p} dangerouslySetInnerHTML={{ __html: renderInline(section.after2) }} />}
      {section.equation3 && <span style={S.eq}><Tex block>{section.equation3}</Tex></span>}
      {section.after3 && <p style={S.p} dangerouslySetInnerHTML={{ __html: renderInline(section.after3) }} />}
    </>
  )
}

export default function DerivationPanel({ sections }) {
  return (
    <div style={S.panel}>
      {sections.map((sec, i) => (
        <DerivationSection key={i} section={sec} />
      ))}
    </div>
  )
}
