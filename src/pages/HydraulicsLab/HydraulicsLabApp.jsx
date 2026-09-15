import React, { useState, Suspense, lazy } from 'react'
import { Leva } from 'leva'

const BernoulliSim = lazy(() => import('./Bernoulli/BernoulliSim.jsx'))
const JetImpactSim = lazy(() => import('./JetImpact/JetImpactSim.jsx'))
const MinorLossesSim = lazy(() => import('./MinorLosses/MinorLossesSim.jsx'))
const PipeFrictionSim = lazy(() => import('./PipeFriction/PipeFrictionSim.jsx'))

const TABS = [
  { id: 'bernoulli',    label: '💧 Bernoulli',       icon: '💧' },
  { id: 'jet-impact',   label: '🚿 Jet Impact',      icon: '🚿' },
  { id: 'minor-losses', label: '⚙️ Minor Losses',    icon: '⚙️' },
  { id: 'pipe-friction',label: '🔧 Pipe Friction',   icon: '🔧' },
]

const S = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: '#03040d',
  },
  tabBar: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'rgba(11,13,26,0.95)',
    borderBottom: '1px solid #2a3152',
    padding: '6px 12px',
    backdropFilter: 'blur(12px)',
    zIndex: 100,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    marginRight: 16,
    whiteSpace: 'nowrap',
  },
  tab: (active) => ({
    padding: '7px 16px',
    fontSize: 12.5,
    borderRadius: 8,
    cursor: 'pointer',
    border: active ? '1px solid #4589ff' : '1px solid #2a3152',
    fontWeight: 600,
    transition: 'all 0.2s',
    background: active ? '#4589ff' : 'rgba(11,13,26,0.9)',
    color: active ? '#fff' : '#9aa2c0',
  }),
  content: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
  },
  loading: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9aa2c0',
    fontSize: 16,
    background: '#03040d',
  },
}

export default function HydraulicsLabApp() {
  const [tab, setTab] = useState('bernoulli')

  return (
    <div style={S.container}>
      <Leva
        collapsed
        theme={{
          sizes: {
            rootWidth: '400px',
            controlWidth: '150px',
          },
        }}
      />
      <div style={S.tabBar}>
        <span style={S.title}>🌊 Hydraulics Lab — Cycle 1</span>
        {TABS.map(t => (
          <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={S.content}>
        <Suspense fallback={<div style={S.loading}>Loading simulation…</div>}>
          {tab === 'bernoulli' && <BernoulliSim />}
          {tab === 'jet-impact' && <JetImpactSim />}
          {tab === 'minor-losses' && <MinorLossesSim />}
          {tab === 'pipe-friction' && <PipeFrictionSim />}
        </Suspense>
      </div>
    </div>
  )
}

