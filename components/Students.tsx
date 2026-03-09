'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { calcAgeMonths, S, Spinner, Err } from './shared'

const FIELDS = [
  { key:'child_code',     label:'เลขที่ *',    ph:'C006' },
  { key:'first_name',    label:'ชื่อ *',       ph:'สมชาย' },
  { key:'last_name',     label:'นามสกุล *',    ph:'ใจดี' },
  { key:'nickname',      label:'ชื่อเล่น',     ph:'ต้น' },
  { key:'guardian_name', label:'ผู้ปกครอง',    ph:'นายสมศักดิ์' },
  { key:'guardian_phone',label:'เบอร์โทร',     ph:'08x-xxx-xxxx' },
]

const EMPTY_FORM = { child_code:'', first_name:'', last_name:'', nickname:'', gender:'ชาย', birth_date:'', guardian_name:'', guardian_phone:'' }

function StudentForm({ title, form, setForm, onSave, onCancel, saving }: any) {
  return (
    <div style={{ ...S.card, marginBottom:20 }}>
      <div style={{ fontWeight:700, marginBottom:14, color:'#1a1a2e', fontSize:16 }}>{title}</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))', gap:10, marginBottom:14 }}>
        {FIELDS.map(f => (
          <div key={f.key}>
            <label style={{ fontSize:12, color:'#888', fontWeight:600, display:'block', marginBottom:4 }}>{f.label}</label>
            <input style={S.input} value={(form as any)[f.key]} placeholder={f.ph}
              onChange={e => setForm((p:any) => ({ ...p, [f.key]: e.target.value }))} />
          </div>
        ))}
        <div>
          <label style={{ fontSize:12, color:'#888', fontWeight:600, display:'block', marginBottom:4 }}>เพศ *</label>
          <select style={{ ...S.sel, width:'100%' }} value={form.gender} onChange={e => setForm((p:any) => ({ ...p, gender: e.target.value }))}>
            <option>ชาย</option><option>หญิง</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize:12, color:'#888', fontWeight:600, display:'block', marginBottom:4 }}>วันเกิด *</label>
          <input type="date" style={S.input} value={form.birth_date} onChange={e => setForm((p:any) => ({ ...p, birth_date: e.target.value }))} />
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button style={S.btn('#4caf82')} onClick={onSave} disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        <button style={S.btn('#aaa')} onClick={onCancel}>ยกเลิก</button>
      </div>
    </div>
  )
}

export default function Students({ center }: any) {
  const [children,   setChildren]   = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [adding,     setAdding]     = useState(false)
  const [editingId,  setEditingId]  = useState<string|null>(null)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState<string|null>(null)
  const [confirmDel, setConfirmDel] = useState<string|null>(null)
  const [addForm,    setAddForm]    = useState({...EMPTY_FORM})
  const [editForm,   setEditForm]   = useState({...EMPTY_FORM})

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('children').select('*').eq('center_id', center.id).eq('status','active').order('child_code')
    setChildren(data || [])
    setLoading(false)
  }, [center])

  useEffect(() => { load() }, [load])

  async function addChild() {
    if (!addForm.first_name || !addForm.last_name || !addForm.birth_date || !addForm.child_code) {
      setError('กรุณากรอก เลขที่ ชื่อ นามสกุล และวันเกิด'); return
    }
    setSaving(true); setError(null)
    const { error: e } = await supabase.from('children').insert({ ...addForm, center_id: center.id, class_room:'อายุ 3-4 ปี', status:'active' })
    if (e) setError(e.message)
    else { setAddForm({...EMPTY_FORM}); setAdding(false); await load() }
    setSaving(false)
  }

  function startEdit(child: any) {
    setEditingId(child.id)
    setEditForm({
      child_code:     child.child_code || '',
      first_name:    child.first_name || '',
      last_name:     child.last_name || '',
      nickname:      child.nickname || '',
      gender:        child.gender || 'ชาย',
      birth_date:    child.birth_date || '',
      guardian_name: child.guardian_name || '',
      guardian_phone:child.guardian_phone || '',
    })
    setError(null)
  }

  async function saveEdit() {
    if (!editForm.first_name || !editForm.last_name || !editForm.birth_date || !editForm.child_code) {
      setError('กรุณากรอก เลขที่ ชื่อ นามสกุล และวันเกิด'); return
    }
    setSaving(true); setError(null)
    const { error: e } = await supabase.from('children').update(editForm).eq('id', editingId)
    if (e) setError(e.message)
    else { setEditingId(null); await load() }
    setSaving(false)
  }

  async function deleteChild(id: string) {
    await supabase.from('children').update({ status: 'inactive' }).eq('id', id)
    setConfirmDel(null)
    await load()
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
        <StudentForm title="เพิ่มนักเรียนใหม่" form={addForm} setForm={setAddForm}
          onSave={addChild} onCancel={() => setAdding(false)} saving={saving} />
      )}

      <div style={S.card}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>{['เลขที่','ชื่อ-นามสกุล','ชื่อเล่น','เพศ','วันเกิด','อายุ','ผู้ปกครอง','จัดการ'].map(h =>
              <th key={h} style={S.th}>{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {children.map(c => (
              <>
                <tr key={c.id} style={{ borderBottom: editingId===c.id ? 'none' : '1px solid #f8f8f8', background: editingId===c.id ? '#f8f9ff' : 'white' }}>
                  <td style={{ ...S.td, color:'#bbb', fontWeight:600 }}>{c.child_code}</td>
                  <td style={{ ...S.td, fontWeight:600, color:'#1a1a2e' }}>{c.first_name} {c.last_name}</td>
                  <td style={{ ...S.td, color:'#777' }}>{c.nickname || '—'}</td>
                  <td style={S.td}><span style={S.badge(c.gender==='ชาย'?'#5b8dd9':'#c06090')}>{c.gender}</span></td>
                  <td style={{ ...S.td, color:'#777' }}>{c.birth_date ? new Date(c.birth_date).toLocaleDateString('th-TH') : '—'}</td>
                  <td style={{ ...S.td, color:'#777' }}>{calcAgeMonths(c.birth_date)} เดือน</td>
                  <td style={{ ...S.td, color:'#777' }}>{c.guardian_name || '—'}</td>
                  <td style={{ ...S.td }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => editingId===c.id ? setEditingId(null) : startEdit(c)} style={{
                        background: editingId===c.id ? '#f0f0f0' : '#e8f0fd',
                        color: editingId===c.id ? '#888' : '#5b8dd9',
                        border:'none', borderRadius:8, padding:'4px 12px', fontSize:12,
                        fontWeight:700, cursor:'pointer', fontFamily:'inherit'
                      }}>{editingId===c.id ? 'ยกเลิก' : '✏️ แก้ไข'}</button>
                      <button onClick={() => setConfirmDel(c.id)} style={{
                        background:'#fff0f0', color:'#e07b54', border:'none',
                        borderRadius:8, padding:'4px 12px', fontSize:12,
                        fontWeight:700, cursor:'pointer', fontFamily:'inherit'
                      }}>🗑 ลบ</button>
                    </div>
                  </td>
                </tr>
                {editingId === c.id && (
                  <tr key={`edit-${c.id}`}>
                    <td colSpan={8} style={{ padding:'0 12px 12px', background:'#f8f9ff' }}>
                      <StudentForm title={`แก้ไขข้อมูล ${c.first_name} ${c.last_name}`}
                        form={editForm} setForm={setEditForm}
                        onSave={saveEdit} onCancel={() => setEditingId(null)} saving={saving} />
                    </td>
                  </tr>
                )}
              </>
            ))}
            {!children.length && (
              <tr><td colSpan={8} style={{ ...S.td, textAlign:'center', color:'#aaa', padding:32 }}>ยังไม่มีข้อมูลนักเรียน</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDel && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, maxWidth:360, width:'90%', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:18, fontWeight:800, color:'#1a1a2e', marginBottom:8 }}>ยืนยันการลบ</div>
            <p style={{ color:'#666', fontSize:14, marginBottom:20 }}>
              คุณต้องการลบนักเรียนคนนี้ออกจากระบบใช่หรือไม่?<br/>
              <span style={{ color:'#aaa', fontSize:12 }}>(ข้อมูลจะถูกซ่อน ไม่ได้ถูกลบถาวร)</span>
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button style={S.btn('#e07b54')} onClick={() => deleteChild(confirmDel)}>ยืนยันลบ</button>
              <button style={S.btn('#aaa')} onClick={() => setConfirmDel(null)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
