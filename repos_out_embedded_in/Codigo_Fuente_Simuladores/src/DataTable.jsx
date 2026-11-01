import React, { useState, useCallback } from 'react'

/**
 * Editable data table for hydraulics lab reports.
 * ─────────────────────────────────────────────────────────────
 * columns = [{ key, label, unit, editable, format }]
 * rows    = [{ id, ...values }]
 * onChange(rowId, key, value)
 */

const S = {
  wrap: {
    overflowX: 'auto', fontSize: 12, marginTop: 10,
    border: '1px solid #2a3152', borderRadius: 8, background: '#0d1020',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '7px 6px', textAlign: 'center', fontWeight: 700, fontSize: 11,
    color: '#9aa2c0', borderBottom: '1px solid #2a3152', background: '#0b0d1a',
    whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 1,
  },
  td: {
    padding: '5px 6px', textAlign: 'center', borderBottom: '1px solid #181d30',
    color: '#c8cfe8', fontVariantNumeric: 'tabular-nums', fontSize: 11.5,
  },
  input: {
    background: '#161a2e', border: '1px solid #2a3152', borderRadius: 4,
    color: '#82cfff', padding: '3px 4px', width: 64, textAlign: 'center',
    fontSize: 11.5, outline: 'none',
  },
  copyBtn: {
    background: 'linear-gradient(135deg,#4589ff,#be95ff)', border: 'none',
    borderRadius: 6, color: '#fff', padding: '7px 14px', fontSize: 12,
    cursor: 'pointer', fontWeight: 600, marginTop: 8,
  },
  error: { color: '#ff6b6b', fontSize: 11 },
}

export default function DataTable({ columns, rows, onChange, title }) {
  const [copied, setCopied] = useState(false)

  const copyCSV = useCallback(() => {
    const header = columns.map(c => `${c.label}${c.unit ? ` (${c.unit})` : ''}`).join('\t')
    const body = rows.map(r =>
      columns.map(c => {
        const v = r[c.key]
        return v != null ? (typeof v === 'number' ? v.toFixed(c.decimals ?? 4) : v) : ''
      }).join('\t'),
    ).join('\n')
    navigator.clipboard.writeText(`${header}\n${body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [columns, rows])

  return (
    <div>
      {title && <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{title}</div>}
      <div style={S.wrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} style={S.th}>
                  {c.label}
                  {c.unit && <div style={{ fontWeight: 400, fontSize: 10 }}>({c.unit})</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.id ?? ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                {columns.map(c => (
                  <td key={c.key} style={S.td}>
                    {c.editable ? (
                      <input
                        type="number"
                        style={S.input}
                        value={row[c.key] ?? ''}
                        onChange={e => onChange && onChange(row.id ?? ri, c.key, parseFloat(e.target.value))}
                        placeholder="—"
                      />
                    ) : (
                      <span>
                        {row[c.key] != null
                          ? (typeof row[c.key] === 'number'
                            ? row[c.key].toFixed(c.decimals ?? 4)
                            : row[c.key])
                          : '—'}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button style={S.copyBtn} onClick={copyCSV}>
        {copied ? '✓ Copied!' : '📋 Copy table to clipboard'}
      </button>
    </div>
  )
}
