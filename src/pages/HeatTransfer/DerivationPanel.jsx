import React, { useMemo, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { getDerivation } from './derivation.js'

function Tex({ children, block = false }) {
  const html = useMemo(
    () => katex.renderToString(children, { displayMode: block, throwOnError: false, strict: false }),
    [children, block]
  )
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

/** Render inline $...$ and standalone LaTeX in a text string */
function renderInline(text) {
  if (!text) return ''
  return text.replace(/\$([^$]+)\$/g, (_, m) => {
    try { return katex.renderToString(m.trim(), { displayMode: false, throwOnError: false, strict: false }) }
    catch { return m }
  })
}

const S = {
  panel: { height: '100%', overflowY: 'auto', padding: '18px 20px', fontSize: 13.5, lineHeight: 1.7, color: '#c8cfe8' },
  h: { color: '#fff', fontSize: 15, margin: '22px 0 8px', fontWeight: 600, borderBottom: '1px solid #1e2338', paddingBottom: 4 },
  h1: { color: '#fff', fontSize: 18, marginBottom: 12, fontWeight: 700 },
  eq: { display: 'block', textAlign: 'center', margin: '12px 0', overflowX: 'auto', padding: '6px 0' },
  mainEq: { display: 'block', textAlign: 'center', margin: '16px 0', padding: '10px 8px', background: '#11142a', border: '1px solid #2a3152', borderRadius: 8, overflowX: 'auto' },
  note: { color: '#8d95b8', fontSize: 12 },
  p: { marginBottom: 6 },
  list: { paddingLeft: 18, marginBottom: 8 },
  brainBtn: {
    background: 'linear-gradient(135deg, #4589ff, #be95ff)', border: 'none', borderRadius: 8,
    color: 'white', padding: '10px 16px', fontSize: 13.5, cursor: 'pointer', fontWeight: 600,
    width: '100%', marginTop: 14,
  },
  brainAnswer: {
    background: '#11142a', border: '1px solid #2a3152', borderRadius: 10,
    padding: 14, marginTop: 12, fontSize: 13, whiteSpace: 'pre-wrap', lineHeight: 1.6,
  },
}

function renderBrainText(text) {
  if (!text) return ''
  let s = text
  s = s.replace(/\$\$(.+?)\$\$/gs, (_, m) => { try { return katex.renderToString(m.trim(), { displayMode: true, throwOnError: false }) } catch { return m } })
  s = s.replace(/\\\[(.+?)\\\]/gs, (_, m) => { try { return katex.renderToString(m.trim(), { displayMode: true, throwOnError: false }) } catch { return m } })
  s = s.replace(/\\\((.+?)\\\)/gs, (_, m) => { try { return katex.renderToString(m.trim(), { displayMode: false, throwOnError: false }) } catch { return m } })
  const LATEX_RE2 = /\\(?:frac|partial|sum|int|nabla|sqrt|left|right|sin|cos|pi|lambda)/
  s = s.split('\n').map(l => {
    const t = l.trim()
    if (/^\\[a-zA-Z]/.test(t) && LATEX_RE2.test(t)) {
      try { return katex.renderToString(t, { displayMode: true, throwOnError: false, strict: false }) } catch { return l }
    }
    return l
  }).join('\n')
  return s
}

function DerivationSection({ section }) {
  if (section.type === 'heading') {
    return <div style={S.h1}>{section.title}</div>
  }
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

export default function DerivationPanel({
  mode = 'solid', L, kCond, Kdiff, q, Twall, srcRadius, wallD, kCavity,
}) {
  const [brainAnswer, setBrainAnswer] = useState(null)
  const [asking, setAsking] = useState(false)

  const sections = useMemo(
    () => getDerivation({ mode, L, kCond, Kdiff, q, Twall, srcRadius, wallD, kCavity }),
    [mode, L, kCond, Kdiff, q, Twall, srcRadius, wallD, kCavity]
  )

  // RAG Brain disabled — no API request, local-only placeholder
  function askBrain() {
    setAsking(true)
    setBrainAnswer(null)
    setTimeout(() => {
      setBrainAnswer(
        '🧠 RAG Brain is not connected in this deployment.\n\n' +
        'The full derivation is shown above — Fourier\'s analytical solution uses separation of variables ' +
        'on the cube domain with Dirichlet BCs, yielding a triple sine series whose coefficients decay ' +
        'exponentially with eigenvalues λ_{nmp} = π²(n²+m²+p²)/L². The slowest mode (1,1,1) sets the ' +
        'thermal time constant τ = L²/(3π²K). At steady state the temperature field satisfies the ' +
        'Poisson equation −k∇²u = Q̇ with the same eigenbasis.'
      )
      setAsking(false)
    }, 800)
  }

  return (
    <div style={S.panel}>
      {sections.map((sec, i) => <DerivationSection key={i} section={sec} />)}

      <div style={S.h}>🧠 Ask the Second Brain</div>
      <p style={S.note}>Query the RAG knowledge graph grounded in the ingested Fourier paper about this exact problem:</p>
      <button style={S.brainBtn} onClick={askBrain} disabled={asking}>
        {asking ? 'Consulting the brain…' : '🧠 How would Fourier solve this? (RAG query)'}
      </button>
      {brainAnswer && (
        <div style={S.brainAnswer} dangerouslySetInnerHTML={{ __html: renderBrainText(brainAnswer) }} />
      )}
    </div>
  )
}
