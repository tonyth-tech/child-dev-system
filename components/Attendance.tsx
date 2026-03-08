'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { THAI_MONTHS, daysInMonth, now, S, Spinner } from './shared'

const CODES      = [null,'present','sick','leave','absent'] as const
const CODE_LABEL: Record<string,string> = { present:'จ', sick:'ป', leave:'ล', absent:'ข' }
const CODE_COLOR: Record<string,string> = { present:'#4caf82', sick:'#f0b429', leave:'#9c6dd8', absent:'#e07b54' }

export default function Attendance({ center }: any) {
  const [children, setChildren] = useState<any[]>([])
  const [records,  setRecords]  = useState<Record<string,Record<number,{code:string,id:string}>>>({})
  const [month,    setMonth]    = useState(now.getMonth())
  const [year]                  = useState(now.getFullYear())
  const [loading,  setLoading]  = useState(true)
  const [busy,     setBusy]     = useState<Record<string,boolean>>({})

  const days = daysInMonth(year, month)
  const cols = Array.from({length:days},(_,i)=>i+1)
  const pad  = (n:number) => String(n).padStart(2,'0')

  const load = useCallback(async () => {
    setLoading(true)
    const first = `${year}-${pad(month+1)}-01`
    const last  = `${year}-${pad(month+1)}-${pad(days)}`
    const [{ data:kids }, { data:att }] = await Promise.all([
      supabase.from('children').select('*').eq('center_id', center.id).eq('status','active').order('child_code'),
      supabase.from('attendance_records').select('*').gte('attendance_date', first).lte('attendance_date', last),
    ])
    setChildren(kids || [])
    const map: any = {}
    att?.forEach(a => {
      const d = new Date(a.attendance_date).getDate()
      if (!map[a.child_id]) map[a.child_id] = {}
      map[a.child_id][d] = { code: a.attendance_code, id: a.id }
    })
    setRecords(map)
    setLoading(false)
  }, [center, month, year, days])

  useEffect(() => { load() }, [load])

  async function toggle(child: any, day: number) {
    const key     = `${child.id}-${day}`
    const cur     = records[child.id]?.[day]?.code ?? null
    const idx     = CODES.indexOf(cur as any)
    const next    = CODES[(idx+1) % CODES.length]
    const dateStr = `${year}-${pad(month+1)}-${pad(day)}`
    setBusy(p => ({ ...p, [key]: true }))
    const existId = records[child.id]?.[day]?.id

    if (next === null) {
      if (existId) await supabase.from('attendance_records').delete().eq('id', existId)
      setRecords(p => { const u={...p}; if(u[child.id]) delete u[child.id][day]; return u })
    } else if (existId) {
      await supabase.from('attendance_records').update({ attendance_code: next }).eq('id', existId)
      setRecords(p => ({ ...p, [child.id]: { ...p[child.id], [day]: { code: next, id: existId } } }))
    } else {
      const { data } = await supabase.from('attendance_records').insert({ child_id:child.id, attendance_date:dateStr, attendance_code:next }).select()
      setRecords(p => ({ ...p, [child.id]: { ...p[child.id], [day]: { code: next, id: data?.[0]?.id } } }))
    }
    setBusy(p => ({ ...p, [key]: false }))
  }

  if (loading) return <Spinner/>

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <h2 style={{ ...S.pageTitle, margin:0 }}>บัญชีเรียกชื่อ</h2>
        <select value={month} onChange={e => setMonth(+e.target.value)} style={S.sel}>
          {THAI_MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <span style={{ color:'#888', fontSize:14 }}>พ.ศ. {year+543}</span>
      </div>

      <div style={{ background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', overflowX:'auto' }}>
        <table style={{ borderCollapse:'collapse', minWidth:'100%' }}>
          <thead>
            <tr style={{ background:'#f8f9ff' }}>
              <th style={{ ...S.th, position:'sticky', left:0, background:'#f8f9ff', minWidth:185, zIndex:2 }}>ชื่อ-นามสกุล</th>
              {cols.map(d => <th key={d} style={{ ...S.th, minWidth:28, textAlign:'center', padding:'8px 2px' }}>{d}</th>)}
              <th style={{ ...S.th, minWidth:44, textAlign:'center' }}>มา</th>
            </tr>
          </thead>
          <tbody>
            {children.map((c, i) => (
              <tr key={c.id} style={{ borderBottom:'1px solid #f5f5f5' }}>
                <td style={{ ...S.td, position:'sticky', left:0, background:'#fff', fontWeight:600, zIndex:1 }}>
                  <span style={{ color:'#bbb', marginRight:8, fontSize:11 }}>{i+1}</span>
                  {c.first_name} {c.last_name}
                </td>
                {cols.map(d => {
                  const code = records[c.id]?.[d]?.code ?? null
                  const key  = `${c.id}-${d}`
                  return (
                    <td key={d} style={{ textAlign:'center', padding:'7px 2px' }}>
                      <button disabled={busy[key]} onClick={() => toggle(c, d)} style={{
                        width:24, height:24, borderRadius:6, border:'none', cursor:'pointer',
                        fontSize:11, fontWeight:800,
                        background: code ? CODE_COLOR[code] : '#f0f0f0',
                        color: code ? '#fff' : '#ccc',
                        opacity: busy[key] ? 0.5 : 1,
                      }}>{code ? CODE_LABEL[code] : '·'}</button>
                    </td>
                  )
                })}
                <td style={{ textAlign:'center', fontWeight:800, color:'#5b8dd9', fontSize:14 }}>
                  {cols.filter(d => records[c.id]?.[d]?.code === 'present').length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop:10, fontSize:12, color:'#aaa', display:'flex', gap:14, flexWrap:'wrap' }}>
        {[['จ','#4caf82','มาเรียน'],['ป','#f0b429','ป่วย'],['ล','#9c6dd8','ลา'],['ข','#e07b54','ขาด']].map(([l,c,t]) => (
          <span key={l}><span style={{ ...S.badge(c), marginRight:4 }}>{l}</span>{t}</span>
        ))}
        <span style={{ color:'#ddd' }}>· คลิกเพื่อเปลี่ยนสถานะ · บันทึกอัตโนมัติ</span>
      </div>
    </div>
  )
}
