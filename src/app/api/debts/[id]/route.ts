import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Ubah tipe params menjadi Promise
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 })

  try {
    const body = await request.json()
    const { id } = await params // 2. Await params sebelum mengambil id
    
    const { data, error } = await supabase
      .from('debts')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id) // Gunakan id yang sudah di-await
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Ubah tipe params menjadi Promise
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 })

  try {
    const { id } = await params // 2. Await params sebelum mengambil id

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id) // Gunakan id yang sudah di-await
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ message: 'Entri berhasil dihapus' })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}