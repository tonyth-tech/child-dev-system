export const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']

export function daysInMonth(y: number, m: number) { return new Date(y, m+1, 0).getDate() }

export function calcAgeMonths(dob: string) {
  if (!dob) return 0
  const d = new Date(dob), t = new Date()
  return (t.getFullYear()-d.getFullYear())*12 + t.getMonth()-d.getMonth()
}

export const now = new Date()

export const S = {
  card:  { background:'#fff', borderRadius:16, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', padding:24, marginBottom:16 } as React.CSSProperties,
  th:    { textAlign:'left' as const, padding:'8px 12px', fontSize:12, color:'#888', fontWeight:700, borderBottom:'2px solid #f0f0f0' },
  td:    { padding:'10px 12px', fontSize:14, borderBottom:'1px solid #f8f8f8' } as React.CSSProperties,
  input: { border:'2px solid #e8e8e8', borderRadius:10, padding:'8px 12px', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' as const, width:'100%' },
  sel:   { border:'2px solid #e8e8e8', borderRadius:10, padding:'8px 12px', fontSize:14, fontFamily:'inherit', background:'#fff', cursor:'pointer' },
  btn:   (bg='#5b8dd9') => ({ background:bg, color:'#fff', border:'none', borderRadius:10, padding:'8px 20px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' } as React.CSSProperties),
  badge: (c: string) => ({ background:c+'22', color:c, borderRadius:99, padding:'2px 10px', fontSize:12, fontWeight:700, display:'inline-block' } as React.CSSProperties),
  pageTitle: { fontSize:22, fontWeight:800, color:'#1a1a2e', margin:'0 0 20px' } as React.CSSProperties,
}

export function Spinner() {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:60, color:'#5b8dd9', fontSize:16 }}>⟳ กำลังโหลด...</div>
}

export function Err({ msg }: { msg: string }) {
  return <div style={{ background:'#fff3f0', border:'1px solid #fcc', borderRadius:12, padding:16, color:'#c00', fontSize:14, marginBottom:12 }}>⚠ {msg}</div>
}
