import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { Calculator, Home, LogOut, TrendingUp, FileText, CheckCircle } from 'lucide-react'
import SignatureModal from './SignatureModal'
import { usePdfGenerator } from '@/hooks/usePdfGenerator'

interface SimulationResult {
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
  downPayment: number
  financedAmount: number
}

function FinancingSimulator() {
  const { user, signOut } = useAuth()
  const [propertyValue, setPropertyValue] = useState<string>('')
  const [downPaymentPercentage, setDownPaymentPercentage] = useState<number>(20)
  const [termYears, setTermYears] = useState<number>(30)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const { generateProposalPdf, downloadPdf } = usePdfGenerator()

  const annualRate = 0.12 // 12% ao ano
  const monthlyRate = annualRate / 12

  const calculateFinancing = () => {
    const value = parseFloat(propertyValue.replace(/[^\d,]/g, '').replace(',', '.'))
    
    if (!value || value <= 0) {
      alert('Por favor, insira um valor válido para o imóvel')
      return
    }

    if (downPaymentPercentage < 20) {
      alert('A entrada mínima é de 20%')
      return
    }

    const downPayment = (value * downPaymentPercentage) / 100
    const financedAmount = value - downPayment
    const totalMonths = termYears * 12

    // Cálculo do SAC (Sistema de Amortização Constante)
    const monthlyAmortization = financedAmount / totalMonths
    let totalInterest = 0
    let remainingBalance = financedAmount
    
    // Calculando a primeira parcela (que será a maior no SAC)
    const firstMonthInterest = remainingBalance * monthlyRate
    const firstMonthlyPayment = monthlyAmortization + firstMonthInterest

    // Calculando juros totais
    for (let i = 0; i < totalMonths; i++) {
      const monthlyInterest = remainingBalance * monthlyRate
      totalInterest += monthlyInterest
      remainingBalance -= monthlyAmortization
    }

    const totalAmount = financedAmount + totalInterest

    setResult({
      monthlyPayment: firstMonthlyPayment,
      totalAmount,
      totalInterest,
      downPayment,
      financedAmount
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatInput = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '')
    if (!numericValue) return ''
    
    const number = parseInt(numericValue)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(number)
  }

  const handlePropertyValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value)
    setPropertyValue(formatted)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const resetSimulation = () => {
    setResult(null)
    setPropertyValue('')
    setDownPaymentPercentage(20)
    setTermYears(30)
  }

  const handleAcceptProposal = () => {
    setIsSignatureModalOpen(true)
  }

  const handleSignatureConfirm = (signatureData: { name: string; cpf: string; signature: string; date: string }) => {
    if (!result || !user?.email) return

    const financingData = {
      propertyValue,
      downPayment: result.downPayment,
      financedAmount: result.financedAmount,
      monthlyPayment: result.monthlyPayment,
      totalAmount: result.totalAmount,
      totalInterest: result.totalInterest,
      termYears,
      downPaymentPercentage,
      userEmail: user.email
    }

    const pdf = generateProposalPdf(financingData, signatureData)
    downloadPdf(pdf, `proposta-financiamento-${signatureData.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    
    setIsSignatureModalOpen(false)
    
    // Feedback visual de sucesso
    alert('PDF gerado e baixado com sucesso! Sua proposta foi assinada digitalmente.')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  SimulaFin
                </h1>
                <p className="text-sm text-muted-foreground">
                  Simulador de Financiamento
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {!result ? (
          // Formulário de Simulação
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Simule seu Financiamento
              </h2>
              <p className="text-muted-foreground">
                Descubra o valor das parcelas do seu imóvel
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyValue" className="text-sm font-medium">
                    Valor do Imóvel
                  </Label>
                  <Input
                    id="propertyValue"
                    type="text"
                    value={propertyValue}
                    onChange={handlePropertyValueChange}
                    placeholder="R$ 0"
                    className="text-lg h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="downPayment" className="text-sm font-medium">
                      Entrada (%)
                    </Label>
                    <Input
                      id="downPayment"
                      type="number"
                      min="20"
                      max="90"
                      value={downPaymentPercentage}
                      onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">Mínimo 20%</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="termYears" className="text-sm font-medium">
                      Prazo (anos)
                    </Label>
                    <Input
                      id="termYears"
                      type="number"
                      min="1"
                      max="35"
                      value={termYears}
                      onChange={(e) => setTermYears(Number(e.target.value))}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Taxa: 12% ao ano (SAC)</span>
                  </div>
                </div>

                <Button 
                  onClick={calculateFinancing} 
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Calcular Financiamento
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Resultados da Simulação
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Resultado da Simulação
              </h2>
              <p className="text-muted-foreground">
                Confira os detalhes do seu financiamento
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Valor da Parcela - Destaque */}
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Primeira Parcela (SAC)
                  </p>
                  <p className="text-4xl font-bold text-primary mb-2">
                    {formatCurrency(result.monthlyPayment)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    As parcelas diminuem mensalmente
                  </p>
                </div>

                <Separator />

                {/* Detalhes do Financiamento */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-card border p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Valor da Entrada</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatCurrency(result.downPayment)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {downPaymentPercentage}% do valor do imóvel
                    </p>
                  </div>

                  <div className="bg-card border p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Valor Financiado</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatCurrency(result.financedAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Em {termYears} anos ({termYears * 12} parcelas)
                    </p>
                  </div>

                  <div className="bg-card border p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total de Juros</p>
                    <p className="text-xl font-semibold text-destructive">
                      {formatCurrency(result.totalInterest)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      12% ao ano
                    </p>
                  </div>

                  <div className="bg-card border p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total a Pagar</p>
                    <p className="text-xl font-semibold text-foreground">
                      {formatCurrency(result.totalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Financiamento + Juros
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Resumo */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-3">
                    Resumo do Financiamento
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor do imóvel:</span>
                      <span className="font-medium">{propertyValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entrada ({downPaymentPercentage}%):</span>
                      <span className="font-medium">{formatCurrency(result.downPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prazo:</span>
                      <span className="font-medium">{termYears} anos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sistema:</span>
                      <span className="font-medium">SAC (parcelas decrescentes)</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button 
                    onClick={resetSimulation} 
                    variant="outline"
                    className="h-12"
                  >
                    Nova Simulação
                  </Button>
                  <Button 
                    onClick={handleAcceptProposal}
                    className="h-12 bg-primary hover:bg-primary/90"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Aceitar Proposta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onConfirm={handleSignatureConfirm}
      />
    </div>
  )
}

export default FinancingSimulator 