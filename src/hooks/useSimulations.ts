import { useState } from 'react'
import { supabase, type Simulation } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface SimulationData {
  userEmail: string
  propertyValue: string
  downPayment: number
  downPaymentPercentage: number
  financedAmount: number
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
  termYears: number
}

export const useSimulations = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Criar nova simulação
  const createSimulation = async (data: SimulationData): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('simulations')
        .insert({
          user_id: user.id,
          user_email: data.userEmail,
          property_value: data.propertyValue,
          down_payment: data.downPayment,
          down_payment_percentage: data.downPaymentPercentage,
          financed_amount: data.financedAmount,
          monthly_payment: data.monthlyPayment,
          total_amount: data.totalAmount,
          total_interest: data.totalInterest,
          term_years: data.termYears
        })

      if (insertError) {
        console.error('Erro ao criar simulação:', insertError)
        setError('Erro ao salvar simulação')
        return false
      }

      return true
    } catch (err) {
      console.error('Erro ao criar simulação:', err)
      setError('Erro inesperado ao salvar simulação')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Buscar simulações do usuário atual
  const fetchUserSimulations = async (): Promise<void> => {
    if (!user) {
      setError('Usuário não autenticado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('simulations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Erro ao buscar simulações do usuário:', fetchError)
        setError('Erro ao carregar suas simulações')
        return
      }

      setSimulations(data || [])
    } catch (err) {
      console.error('Erro ao buscar simulações do usuário:', err)
      setError('Erro inesperado ao carregar suas simulações')
    } finally {
      setLoading(false)
    }
  }

  // Deletar uma simulação
  const deleteSimulation = async (simulationId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('simulations')
        .delete()
        .eq('id', simulationId)

      if (deleteError) {
        console.error('Erro ao deletar simulação:', deleteError)
        setError('Erro ao deletar simulação')
        return false
      }

      // Atualizar a lista local
      setSimulations(prev => prev.filter(sim => sim.id !== simulationId))

      return true
    } catch (err) {
      console.error('Erro ao deletar simulação:', err)
      setError('Erro inesperado ao deletar simulação')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    simulations,
    loading,
    error,
    createSimulation,
    fetchUserSimulations,
    deleteSimulation,
    setError
  }
} 