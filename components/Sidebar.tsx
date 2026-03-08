'use client'

const NAV = [
  { key:'dashboard',   label:'ภาพรวม',        icon:'◈' },
  { key:'students',    label:'ข้อมูลเด็ก',      icon:'◉' },
  { key:'attendance',  label:'บัญชีเรียกชื่อ',  icon:'▦' },
  { key:'development', label:'บันทึกพัฒนาการ',  icon:'◆' },
  { key:'reports',     label:'รายงาน',          icon:'▤' },
]

const now = new Date()

export default function Sidebar({ page, setPage, center }: any) {
  return (
    <aside style={{ width:224, background:'#1a1a2e', display:'flex', flexDirection:'column', padding:'24px 0', flexShrink:0, minHeight:'100vh' }}>
      <div style={{ padding:'0 20px 20px', borderBottom:'1px solid #2a2a40' }}>
        <div style={{ fontSize:11, color:'#5b8dd9', fontWeight:800, letterSpacing:1, marginBottom:4 }}>ศพด. ระบบดิจิทัล</div>
        <div style={{ fontSize:13, color:'#ccc', fontWeight:600, lineHeight:1.5 }}>{center?.name}</div>
        <div style={{ fontSize:11, color:'#555', marginTop:4 }}>อ.{center?.district} · จ.{center?.province}</div>
      </div>

      <div style={{ padding:'12px 0', flex:1 }}>
        {NAV.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)} style={{
            background: page===n.key ? 'rgba(91,141,217,0.15)' : 'none',
            border: 'none',
            borderLeft: `3px solid ${page===n.key ? '#5b8dd9' : 'transparent'}`,
            color: page===n.key ? '#5b8dd9' : '#777',
            padding:'11px 20px', textAlign:'left', cursor:'pointer',
            fontSize:14, fontWeight: page===n.key ? 700 : 400,
            width:'100%', display:'flex', alignItems:'center', gap:10,
            fontFamily:'inherit',
          }}>
            <span style={{ fontSize:16 }}>{n.icon}</span> {n.label}
          </button>
        ))}
      </div>

      <div style={{ padding:'16px 20px', borderTop:'1px solid #2a2a40' }}>
        <div style={{ fontSize:11, color:'#555' }}>ปีการศึกษา</div>
        <div style={{ fontSize:14, color:'#ccc', fontWeight:700 }}>{now.getFullYear()+543}</div>
        <div style={{ fontSize:11, color:'#444', marginTop:2 }}>ชั้นอายุ 3–4 ปี</div>
      </div>
    </aside>
  )
}
