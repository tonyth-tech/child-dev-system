'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { THAI_MONTHS, now, S, Spinner } from './shared'

export default function Dashboard({ center }: any) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const today = now.toISOString().slice(0,10)
      const [{ data: kids }, { data: att }] = await Promise.all([
        supabase.from('children').select('id,gender').eq('center_id', center.id).eq('status','active'),
        supabase.from('attendance_records').select('attendance_code').eq('attendance_date', today),
      ])
      setStats({
        total:   kids?.length ?? 0,
        boys:    kids?.filter(c=>c.gender==='ชาย').length ?? 0,
        girls:   kids?.filter(c=>c.gender==='หญิง').length ?? 0,
        present: att?.filter(a=>a.attendance_code==='present').length ?? 0,
      })
    }
    load()
  }, [center])

  const cards = stats ? [
    { label:'นักเรียนทั้งหมด', value:stats.total,   sub:`ชาย ${stats.boys} · หญิง ${stats.girls}`,  color:'#5b8dd9', icon:'◉' },
    { label:'มาเรียนวันนี้',   value:stats.present, sub:`จาก ${stats.total} คน`,                    color:'#4caf82', icon:'▦' },
    { label:'ปีการศึกษา',     value:now.getFullYear()+543, sub:'ภาคเรียนที่ 1',                    color:'#e07b54', icon:'◈' },
    { label:'เดือนปัจจุบัน',  value:THAI_MONTHS[now.getMonth()], sub:`วันที่ ${now.getDate()}`,     color:'#9c6dd8', icon:'▤' },
  ] : []

  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:800, color:'#1a1a2e', margin:'0 0 4px' }}>ภาพรวมชั้นเรียน</h2>
      <p style={{ color:'#888', margin:'0 0 24px', fontSize:14 }}>{center.name} · อ.{center.district} · จ.{center.province}</p>

      {!stats ? <Spinner/> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:24 }}>
          {cards.map(c => (
            <div key={c.label} style={{ ...S.card, padding:'18px 20px', marginBottom:0, borderLeft:`4px solid ${c.color}` }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{c.icon}</div>
              <div style={{ fontSize:32, fontWeight:900, color:c.color, lineHeight:1 }}>{c.value}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'#333', margin:'4px 0 2px' }}>{c.label}</div>
              <div style={{ fontSize:12, color:'#888' }}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div style={S.card}>
        <div style={{ fontWeight:700, color:'#5b8dd9', marginBottom:8 }}>ℹ เกี่ยวกับระบบ</div>
        <p style={{ margin:0, fontSize:13, color:'#666', lineHeight:1.8 }}>
          ระบบบันทึกพัฒนาการเด็กปฐมวัย ศพด. สำหรับ{center.name}<br/>
          รองรับ: บัญชีเรียกชื่อ · บันทึกพัฒนาการ 5 ด้าน · รายงานสรุปรายเด็ก<br/>
          ตามแบบ ศพด.02/1 อายุ 3–4 ปี
        </p>
      </div>
    </div>
  )
}
