'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import Students from '@/components/Students'
import Attendance from '@/components/Attendance'
import Development from '@/components/Development'
import Reports from '@/components/Reports'

const CENTER_NAME = process.env.NEXT_PUBLIC_CENTER_NAME || 'ศูนย์พัฒนาเด็กเล็กตำบลเหมืองจี้'

export default function Home() {
  const [page,    setPage]    = useState('dashboard')
  const [center,  setCenter]  = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string|null>(null)

  useEffect(() => {
    supabase
      .from('centers')
      .select('*')
      .eq('name', CENTER_NAME)
      .limit(1)
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else if (data && data.length > 0) setCenter(data[0])
        else setError('ไม่พบศูนย์ในฐานข้อมูล — กรุณารัน SQL seed ก่อน')
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#5b8dd9', fontSize:18 }}>
      ⟳ กำลังเชื่อมต่อฐานข้อมูล...
    </div>
  )

  if (error) return (
    <div style={{ padding:40 }}>
      <div style={{ background:'#fff3f0', border:'1px solid #fcc', borderRadius:12, padding:20, color:'#c00' }}>
        ⚠ {error}
      </div>
    </div>
  )

  const props = { center }

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar page={page} setPage={setPage} center={center} />
      <main style={{ flex:1, padding:'28px 32px 48px', overflowY:'auto', maxHeight:'100vh', background:'#f4f6fb' }}>
        {page === 'dashboard'   && <Dashboard   {...props} />}
        {page === 'students'    && <Students    {...props} />}
        {page === 'attendance'  && <Attendance  {...props} />}
        {page === 'development' && <Development {...props} />}
        {page === 'reports'     && <Reports     {...props} />}
      </main>
    </div>
  )
}
