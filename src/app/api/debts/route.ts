import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  let query = supabase.from('debts').select('*').order('created_at', { ascending: false })

  if (type && type !== 'semua') {
    query = query.eq('type', type)
  }

  if (status === 'lunas') {
    query = query.not('settled_at', 'is', null)
  } else if (status === 'belum') {
    query = query.is('settled_at', null)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 401 })

  try {
    const body = await request.json()
    const { type, counterpart_name, amount, note, due_date } = body

    if (!type || !counterpart_name || amount === undefined) {
      return NextResponse.json({ error: 'Data wajib (Tipe, Nama, Jumlah) tidak lengkap' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Jumlah harus berupa angka lebih dari 0' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        type,
        counterpart_name,
        amount,
        note: note || null,
        due_date: due_date || null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}