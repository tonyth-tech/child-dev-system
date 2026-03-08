'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { THAI_MONTHS, daysInMonth, calcAgeMonths, now, S, Spinner } from './shared'

export default function Reports({ center }: any) {
  const [children,  setChildren]  = useState<any[]>([])
  const [summaries, setSummaries] = useState<Record<string,{present:number}>>({})
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const m=now.getMonth(), y=now.getFullYear(), dm=daysInMonth(y,m)
      const pad=(n:number)=>String(n).padStart(2,'0')
      const [{ data:kids }, { data:att }] = await Promise.all([
        supabase.from('children').select('*').eq('center_id', center.id).eq('status','active').order('child_code'),
        supabase.from('attendance_records').select('child_id,attendance_code')
          .gte('attendance_date', `${y}-${pad(m+1)}-01`)
          .lte('attendance_date', `${y}-${pad(m+1)}-${pad(dm)}`),
      ])
      const map: Record<string,{present:number}> = {}
      att?.forEach(a => {
        if (!map[a.child_id]) map[a.child_id] = { present:0 }
        if (a.attendance_code==='present') map[a.child_id].present++
      })
      setChildren(kids || [])
      setSummaries(map)
      setLoading(false)
    }
    load()
  }, [center])

  if (loading) return <Spinner/>

  const totalDays = daysInMonth(now.getFullYear(), now.getMonth())

  return (
    <div>
      <h2 style={{ ...S.pageTitle }}>รายงานสรุป · {THAI_MONTHS[now.getMonth()]} {now.getFullYear()+543}</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {children.map(c => {
          const present = summaries[c.id]?.present ?? 0
          const pct     = Math.round((present/totalDays)*100)
          const pctCol  = pct>=80 ? '#4caf82' : pct>=60 ? '#f0b429' : '#e07b54'
          return (
            <div key={c.id} style={S.card}>
              <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:c.gender==='ชาย'?'#e8f0fd':'#fce8f4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                  {c.gender==='ชาย' ? '👦' : '👧'}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:'#1a1a2e' }}>{c.first_name} {c.last_name}</div>
                  <div style={{ fontSize:12, color:'#aaa' }}>เลขที่ {c.child_code} · {calcAgeMonths(c.birth_date)} เดือน</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                <div style={{ flex:1, background:'#f8f9ff', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:900, color:pctCol }}>{pct}%</div>
                  <div style={{ fontSize:11, color:'#888' }}>การมาเรียน</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>{present}/{totalDays} วัน</div>
                </div>
                <div style={{ flex:1, background:'#f8fff9', borderRadius:10, padding:'10px 12px', textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:900, color:'#4caf82' }}>{calcAgeMonths(c.birth_date)}</div>
                  <div style={{ fontSize:11, color:'#888' }}>อายุ (เดือน)</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>{c.gender}</div>
                </div>
              </div>
              <div style={{ height:6, background:'#f0f0f0', borderRadius:99 }}>
                <div style={{ height:'100%', width:`${pct}%`, background:pctCol, borderRadius:99, transition:'width 0.4s' }}/>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
