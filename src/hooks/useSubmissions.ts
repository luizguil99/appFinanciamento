import { useState } from 'react'
import { supabase, type FinancingSubmission } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface SubmissionData {
  userEmail: string
  userName: string
  userCpf: string
  propertyValue: string
  downPayment: number
  downPaymentPercentage: number
  financedAmount: number
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
  termYears: number
  signatureData?: string
}

export const useSubmissions = () => {
  const [submissions, setSubmissions] = useState<FinancingSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Criar nova submissão
  const createSubmission = async (data: SubmissionData): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('financing_submissions')
        .insert({
          user_id: user.id,
          user_email: data.userEmail,
          user_name: data.userName,
          user_cpf: data.userCpf,
          property_value: data.propertyValue,
          down_payment: data.downPayment,
          down_payment_percentage: data.downPaymentPercentage,
          financed_amount: data.financedAmount,
          monthly_payment: data.monthlyPayment,
          total_amount: data.totalAmount,
          total_interest: data.totalInterest,
          term_years: data.termYears,
          signature_data: data.signatureData || '',
          status: 'pending'
        })

      if (insertError) {
        console.error('Erro ao criar submissão:', insertError)
        setError('Erro ao salvar submissão')
        return false
      }

      return true
    } catch (err) {
      console.error('Erro ao criar submissão:', err)
      setError('Erro inesperado ao salvar submissão')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Buscar todas as submissões (apenas para admins)
  const fetchAllSubmissions = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('financing_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Erro ao buscar submissões:', fetchError)
        setError('Erro ao carregar submissões')
        return
      }

      setSubmissions(data || [])
    } catch (err) {
      console.error('Erro ao buscar submissões:', err)
      setError('Erro inesperado ao carregar submissões')
    } finally {
      setLoading(false)
    }
  }

  // Buscar submissões do usuário atual
  const fetchUserSubmissions = async (): Promise<void> => {
    if (!user) {
      setError('Usuário não autenticado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('financing_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Erro ao buscar submissões do usuário:', fetchError)
        setError('Erro ao carregar suas submissões')
        return
      }

      setSubmissions(data || [])
    } catch (err) {
      console.error('Erro ao buscar submissões do usuário:', err)
      setError('Erro inesperado ao carregar suas submissões')
    } finally {
      setLoading(false)
    }
  }

  // Atualizar status da submissão (apenas para admins)
  const updateSubmissionStatus = async (submissionId: string, newStatus: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('financing_submissions')
        .update({ status: newStatus })
        .eq('id', submissionId)

      if (updateError) {
        console.error('Erro ao atualizar status:', updateError)
        setError('Erro ao atualizar status')
        return false
      }

      // Atualizar a lista local
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submissionId 
            ? { ...sub, status: newStatus }
            : sub
        )
      )

      return true
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      setError('Erro inesperado ao atualizar status')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Verificar se o usuário é admin
  const checkIsAdmin = async (): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erro ao verificar admin:', error)
        return false
      }

      return data?.is_admin || false
    } catch (err) {
      console.error('Erro ao verificar admin:', err)
      return false
    }
  }

  return {
    submissions,
    loading,
    error,
    createSubmission,
    fetchAllSubmissions,
    fetchUserSubmissions,
    updateSubmissionStatus,
    checkIsAdmin,
    setError
  }
} 