'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { now, S, Spinner } from './shared'

const DOMAIN_COLORS = ['#e07b54','#5b8dd9','#9c6dd8','#4caf82','#f0b429']
const SCORE_COLORS: Record<number,string> = { 3:'#4caf82', 2:'#f0b429', 1:'#e07b54' }

export default function Development({ center }: any) {
  const [children,      setChildren]      = useState<any[]>([])
  const [domains,       setDomains]       = useState<any[]>([])
  const [items,         setItems]         = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState<any>(null)
  const [semester,      setSemester]      = useState('1')
  const [scores,        setScores]        = useState<Record<string,{score:number|null,id:string}>>({})
  const [assessmentId,  setAssessmentId]  = useState<string|null>(null)
  const [loading,       setLoading]       = useState(true)
  const [busy,          setBusy]          = useState<Record<string,boolean>>({})

  useEffect(() => {
    async function load() {
      const [{ data:kids }, { data:dom }, { data:its }] = await Promise.all([
        supabase.from('children').select('*').eq('center_id', center.id).eq('status','active').order('child_code'),
        supabase.from('development_domains').select('*').order('sort_order'),
        supabase.from('development_items').select('*').eq('active', true).order('sort_order'),
      ])
      setChildren(kids || [])
      setDomains(dom || [])
      setItems(its || [])
      if (kids?.length) setSelectedChild(kids[0])
      setLoading(false)
    }
    load()
  }, [center])

  useEffect(() => {
    if (!selectedChild) return
    async function loadScores() {
      const year = String(now.getFullYear())
      const { data: asms } = await supabase.from('assessments').select('id')
        .eq('child_id', selectedChild.id).eq('term', semester).eq('academic_year', year)
      if (asms?.length) {
        const aid = asms[0].id
        setAssessmentId(aid)
        const { data: checks } = await supabase.from('assessment_checks').select('*').eq('assessment_id', aid)
        const map: any = {}
        checks?.forEach(ch => { map[ch.development_item_id] = { score: ch.score, id: ch.id } })
        setScores(map)
      } else {
        setAssessmentId(null)
        setScores({})
      }
    }
    loadScores()
  }, [selectedChild, semester])

  async function ensureAssessment() {
    if (assessmentId) return assessmentId
    const year = String(now.getFullYear())
    const { data } = await supabase.from('assessments')
      .insert({ child_id: selectedChild.id, term: semester, academic_year: year, note: '' })
      .select()
    const aid = data![0].id
    setAssessmentId(aid)
    return aid
  }

  async function setScore(itemId: string, score: number | null) {
    setBusy(p => ({ ...p, [itemId]: true }))
    const aid = await ensureAssessment()
    const ex  = scores[itemId]
    if (ex?.id) {
      await supabase.from('assessment_checks').update({ score, checked: (score ?? 0) >= 2 }).eq('id', ex.id)
      setScores(p => ({ ...p, [itemId]: { ...p[itemId], score } }))
    } else {
      const { data } = await supabase.from('assessment_checks')
        .insert({ assessment_id: aid, development_item_id: itemId, score, checked: (score ?? 0) >= 2 })
        .select()
      setScores(p => ({ ...p, [itemId]: { score, id: data?.[0]?.id } }))
    }
    setBusy(p => ({ ...p, [itemId]: false }))
  }

  if (loading) return <Spinner/>

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <h2 style={{ ...S.pageTitle, margin:0 }}>บันทึกพัฒนาการ</h2>
        <select value={selectedChild?.id || ''} onChange={e => setSelectedChild(children.find(c => c.id===e.target.value))} style={S.sel}>
          {children.map(c => <option key={c.id} value={c.id}>{c.child_code} · {c.first_name} {c.last_name}</option>)}
        </select>
        <div style={{ display:'flex', gap:6 }}>
          {['1','2'].map(s => (
            <button key={s} onClick={() => setSemester(s)} style={{
              padding:'7px 16px', borderRadius:10,
              border:`2px solid ${semester===s?'#5b8dd9':'#e8e8e8'}`,
              background: semester===s?'#5b8dd9':'#fff',
              color: semester===s?'#fff':'#555',
              fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'inherit',
            }}>ภาคเรียนที่ {s}</button>
          ))}
        </div>
      </div>

      {selectedChild && domains.map((domain, di) => {
        const domItems = items.filter(i => i.domain_id === domain.id)
        if (!domItems.length) return null
        const color = DOMAIN_COLORS[di] || '#5b8dd9'
        return (
          <div key={domain.id} style={{ ...S.card, padding:0, overflow:'hidden', marginBottom:14 }}>
            <div style={{ background:color, padding:'12px 20px' }}>
              <span style={{ color:'#fff', fontWeight:800, fontSize:15 }}>{domain.name_th}</span>
            </div>
            <div style={{ padding:'4px 20px 12px' }}>
              {domItems.map(item => {
                const cur = scores[item.id]?.score ?? null
                return (
                  <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f5f5f5', gap:12 }}>
                    <span style={{ fontSize:13, color:'#444', flex:1 }}>{item.item_text}</span>
                    <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                      {[3,2,1].map(v => (
                        <button key={v} disabled={busy[item.id]} onClick={() => setScore(item.id, cur===v ? null : v)} style={{
                          width:36, height:30, borderRadius:8,
                          border:`2px solid ${SCORE_COLORS[v]}`,
                          background: cur===v ? SCORE_COLORS[v] : 'transparent',
                          color: cur===v ? '#fff' : SCORE_COLORS[v],
                          fontWeight:800, fontSize:13, cursor:'pointer', fontFamily:'inherit',
                          opacity: busy[item.id] ? 0.5 : 1,
                        }}>{v}</button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <p style={{ fontSize:12, color:'#aaa', marginTop:8 }}>3 = ปรากฏตามช่วงอายุ (ดี) · 2 = ปรากฏโดยมีการกระตุ้น · 1 = ควรส่งเสริม · คลิกซ้ำเพื่อยกเลิก</p>
    </div>
  )
}
