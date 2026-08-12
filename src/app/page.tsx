'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { formatRupiah, formatRelativeTime, cn } from '@/lib/utils'
import { LogOut, Plus, Check, Edit2, Trash2 } from 'lucide-react'
import type { Debt } from '@/types'
import DebtModal from '@/components/DebtModal'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<'semua' | 'belum' | 'lunas'>('semua')
  const [typeFilter, setTypeFilter] = useState<'semua' | 'owed_to_me' | 'i_owe'>('semua')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)

  const fetchDebts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'semua') params.append('status', statusFilter)
      if (typeFilter !== 'semua') params.append('type', typeFilter)

      const res = await fetch(`/api/debts?${params.toString()}`)
      if (!res.ok) throw new Error('Gagal mengambil data')
      const data = await res.json()
      setDebts(data)
    } catch (error) {
      console.error(error)
      alert('Gagal memuat data utang.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter])

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleStatus = async (id: string, currentSettledAt: string | null) => {
    try {
      const payload = { settled_at: currentSettledAt ? null : new Date().toISOString() }
      const res = await fetch(`/api/debts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Gagal update status')
      fetchDebts()
    } catch (error) {
      alert('Gagal mengubah status utang.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus catatan ini?')) return
    try {
      const res = await fetch(`/api/debts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus data')
      fetchDebts()
    } catch (error) {
      alert('Gagal menghapus catatan.')
    }
  }

  const openEdit = (debt: Debt) => {
    setEditingDebt(debt)
    setIsModalOpen(true)
  }

  // Kalkulasi Summary (Hanya menghitung yang belum lunas)
  const activeDebts = debts.filter(d => !d.settled_at)
  
  const totalOwedToMe = activeDebts
    .filter(d => d.type === 'owed_to_me')
    .reduce((acc, curr) => acc + curr.amount, 0)
    
  const totalIOwe = activeDebts
    .filter(d => d.type === 'i_owe')
    .reduce((acc, curr) => acc + curr.amount, 0)
    
  const netAmount = totalOwedToMe - totalIOwe

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-10">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">Kasbon</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
            <LogOut size={18} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total dihutang ke saya</p>
            <p className="text-2xl font-semibold text-blue-600">{formatRupiah(totalOwedToMe)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total saya hutang</p>
            <p className="text-2xl font-semibold text-orange-600">{formatRupiah(totalIOwe)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Net (Selisih)</p>
            <p className={cn("text-2xl font-semibold", netAmount >= 0 ? "text-emerald-600" : "text-red-600")}>
              {formatRupiah(netAmount)}
            </p>
          </div>
        </section>

        {/* Action & Filters */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button 
            onClick={() => { setEditingDebt(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} /> Catat baru
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 sm:flex-none border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
            >
              <option value="semua">Semua Status</option>
              <option value="belum">Belum Lunas</option>
              <option value="lunas">Lunas</option>
            </select>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="flex-1 sm:flex-none border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
            >
              <option value="semua">Semua Tipe</option>
              <option value="owed_to_me">Dihutang ke Saya</option>
              <option value="i_owe">Saya Hutang</option>
            </select>
          </div>
        </section>

        {/* Debt List */}
        <section className="bg-white border rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Memuat data...</div>
          ) : debts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="mb-2">Belum ada catatan.</p>
              <p className="text-sm">Klik "Catat baru" untuk mulai mencatat utang/piutang.</p>
            </div>
          ) : (
            <div className="divide-y">
              {debts.map((debt) => (
                <div key={debt.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{debt.counterpart_name}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        debt.type === 'owed_to_me' ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {debt.type === 'owed_to_me' ? 'Dihutang' : 'Hutang'}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">{formatRupiah(debt.amount)}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatRelativeTime(debt.created_at)}</span>
                      {debt.note && <span>• {debt.note}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 border-t sm:border-0 pt-3 sm:pt-0">
                    <button 
                      onClick={() => toggleStatus(debt.id, debt.settled_at)}
                      className={cn(
                        "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border",
                        debt.settled_at 
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                      )}
                    >
                      <Check size={16} />
                      {debt.settled_at ? 'Lunas' : 'Tandai lunas'}
                    </button>
                    <button onClick={() => openEdit(debt)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(debt.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <DebtModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingDebt(null); }} 
        onSuccess={fetchDebts}
        editData={editingDebt}
      />
    </div>
  )
}