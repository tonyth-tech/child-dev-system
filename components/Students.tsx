'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { calcAgeMonths, S, Spinner, Err } from './shared'

const FIELDS = [
  { key:'child_code',    label:'เลขที่ *',     ph:'C006' },
  { key:'first_name',   label:'ชื่อ *',        ph:'สมชาย' },
  { key:'last_name',    label:'นามสกุล *',     ph:'ใจดี' },
  { key:'nickname',     label:'ชื่อเล่น',      ph:'ต้น' },
  { key:'guardian_name',label:'ผู้ปกครอง',     ph:'นายสมศักดิ์' },
  { key:'guardian_phone',label:'เบอร์โทร',     ph:'08x-xxx-xxxx' },
]

export default function Students({ center }: any) {
  const [children, setChildren] = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string|null>(null)
  const [form, setForm] = useState({ child_code:'', first_name:'', last_name:'', nickname:'', gender:'ชาย', birth_date:'', guardian_name:'', guardian_phone:'' })

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('children').select('*').eq('center_id', center.id).eq('status','active').order('child_code')
    setChildren(data || [])
    setLoading(false)
  }, [center])

  useEffect(() => { load() }, [load])

  async function addChild() {
    if (!form.first_name || !form.last_name || !form.birth_date || !form.child_code) {
      setError('กรุณากรอก เลขที่ ชื่อ นามสกุล และวันเกิด'); return
    }
    setSaving(true); setError(null)
    const { error: e } = await supabase.from('children').insert({ ...form, center_id: center.id, class_room:'อายุ 3-4 ปี', status:'active' })
    if (e) setError(e.message)
    else {
      setForm({ child_code:'', first_name:'', last_name:'', nickname:'', gender:'ชาย', birth_date:'', guardian_name:'', guardian_phone:'' })
      setAdding(false)
      await load()
    }
    setSaving(false)
  }

  if (loading) return <Spinner/>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ ...S.pageTitle, margin:0 }}>ข้อมูลนักเรียน ({children.length} คน)</h2>
        <button style={S.btn()} onClick={() => { setAdding(true); setError(null) }}>+ เพิ่มนักเรียน</button>
      </div>

      {error && <Err msg={error}/>}

      {adding && (
        <div style={{ ...S.card, marginBottom:20 }}>
          <div style={{ fontWeight:700, marginBottom:14, color:'#1a1a2e' }}>เพิ่มนักเรียนใหม่</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', gap:10, marginBottom:14 }}>
            {FIELDS.map(f => (
              <div key={f.key}>
                <label style={{ fontSize:12, color:'#888', fontWeight:600, display:'block', marginBottom:4 }}>{f.label}</label>
                <input style={S.input} value={(form as any)[f.key]} placeholder={f.ph}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={{ fontSize:12, color:'#888', fontWeight:600, display:'block', marginBottom:4 }}>เพศ *</label>
              <select style={{ ...S.sel, width:'100%' }} value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                <option>ชาย</option><option>หญิง</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, color:'#888', fontWeight:600, display:'block', marginBottom:4 }}>วันเกิด *</label>
              <input type="date" style={S.input} value={form.birth_date} onChange={e => setForm(p => ({ ...p, birth_date: e.target.value }))} />
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button style={S.btn('#4caf82')} onClick={addChild} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
            <button style={S.btn('#aaa')} onClick={() => setAdding(false)}>ยกเลิก</button>
          </div>
        </div>
      )}

      <div style={S.card}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>{['เลขที่','ชื่อ-นามสกุล','ชื่อเล่น','เพศ','วันเกิด','อายุ','ผู้ปกครอง'].map(h =>
              <th key={h} style={S.th}>{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {children.map(c => (
              <tr key={c.id}>
                <td style={{ ...S.td, color:'#bbb', fontWeight:600 }}>{c.child_code}</td>
                <td style={{ ...S.td, fontWeight:600, color:'#1a1a2e' }}>{c.first_name} {c.last_name}</td>
                <td style={{ ...S.td, color:'#777' }}>{c.nickname || '—'}</td>
                <td style={S.td}><span style={S.badge(c.gender==='ชาย'?'#5b8dd9':'#c06090')}>{c.gender}</span></td>
                <td style={{ ...S.td, color:'#777' }}>{c.birth_date ? new Date(c.birth_date).toLocaleDateString('th-TH') : '—'}</td>
                <td style={{ ...S.td, color:'#777' }}>{calcAgeMonths(c.birth_date)} เดือน</td>
                <td style={{ ...S.td, color:'#777' }}>{c.guardian_name || '—'}</td>
              </tr>
            ))}
            {!children.length && (
              <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'#aaa', padding:32 }}>ยังไม่มีข้อมูลนักเรียน</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
