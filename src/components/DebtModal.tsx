'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Debt } from '@/types'

interface DebtModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: Debt | null
}

export default function DebtModal({ isOpen, onClose, onSuccess, editData }: DebtModalProps) {
  const [type, setType] = useState<'owed_to_me' | 'i_owe'>('owed_to_me')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editData) {
      setType(editData.type)
      setName(editData.counterpart_name)
      setAmount(editData.amount.toString())
      setNote(editData.note || '')
    } else {
      setType('owed_to_me')
      setName('')
      setAmount('')
      setNote('')
    }
  }, [editData, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const numericAmount = parseInt(amount, 10)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Jumlah harus berupa angka valid lebih dari 0.')
      setLoading(false)
      return
    }

    const payload = {
      type,
      counterpart_name: name,
      amount: numericAmount,
      note,
      due_date: new Date().toISOString().split('T')[0] // Default hari ini
    }

    try {
      const url = editData ? `/api/debts/${editData.id}` : '/api/debts'
      const method = editData ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{editData ? 'Edit Catatan' : 'Catat Baru'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <div className="p-2 bg-red-50 text-red-600 text-sm rounded">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={type === 'owed_to_me'} onChange={() => setType('owed_to_me')} className="text-blue-600 focus:ring-blue-500" />
                <span className="text-sm">Saya dihutang</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={type === 'i_owe'} onChange={() => setType('i_owe')} className="text-blue-600 focus:ring-blue-500" />
                <span className="text-sm">Saya hutang</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Misal: Budi" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="100000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} rows={2} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Untuk bayar makan..." />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}