import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { Calculator, Home, LogOut, TrendingUp, FileText, CheckCircle } from 'lucide-react'
import SignatureModal from './SignatureModal'
import { usePdfGenerator } from '@/hooks/usePdfGenerator'
import { useSubmissions } from '@/hooks/useSubmissions'
import { useSimulations } from '@/hooks/useSimulations'

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
  const [simulationSaved, setSimulationSaved] = useState(false)
  const { generateProposalPdf, downloadPdf } = usePdfGenerator()
  const { createSubmission } = useSubmissions()
  const { createSimulation } = useSimulations()

  const annualRate = 0.12 // 12% ao ano
  const monthlyRate = annualRate / 12

  const calculateFinancing = async () => {
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

    const simulationResult = {
      monthlyPayment: firstMonthlyPayment,
      totalAmount,
      totalInterest,
      downPayment,
      financedAmount
    }

    setResult(simulationResult)
    setSimulationSaved(false)

    // Salvar a simulação automaticamente no banco de dados
    if (user?.email) {
      const simulationData = {
        userEmail: user.email,
        propertyValue,
        downPayment,
        downPaymentPercentage,
        financedAmount,
        monthlyPayment: firstMonthlyPayment,
        totalAmount,
        totalInterest,
        termYears
      }

      const saved = await createSimulation(simulationData)
      if (saved) {
        setSimulationSaved(true)
        setTimeout(() => setSimulationSaved(false), 3000) // Remove a mensagem após 3 segundos
      }
    }
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
    setSimulationSaved(false)
  }

  const handleAcceptProposal = () => {
    setIsSignatureModalOpen(true)
  }

  const handleSignatureConfirm = async (signatureData: { name: string; cpf: string; signature: string; date: string }) => {
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

    // Salvar submissão no Supabase
    const submissionData = {
      userEmail: user.email,
      userName: signatureData.name,
      userCpf: signatureData.cpf.replace(/\D/g, ''), // Remove formatação do CPF
      propertyValue,
      downPayment: result.downPayment,
      downPaymentPercentage,
      financedAmount: result.financedAmount,
      monthlyPayment: result.monthlyPayment,
      totalAmount: result.totalAmount,
      totalInterest: result.totalInterest,
      termYears,
      signatureData: signatureData.signature
    }

    const submissionSuccess = await createSubmission(submissionData)
    
    if (!submissionSuccess) {
      alert('Erro ao salvar a submissão. Tente novamente.')
      return
    }

    // Gerar e baixar PDF
    const pdf = generateProposalPdf(financingData, signatureData)
    downloadPdf(pdf, `proposta-financiamento-${signatureData.name.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    
    setIsSignatureModalOpen(false)
    
    // Feedback visual de sucesso
    alert('Proposta enviada com sucesso! O PDF foi gerado e sua submissão está sendo analisada.')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg shadow-sm">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  SimuleFin
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
              className="flex items-center space-x-2 border-2 border-border hover:border-primary hover:bg-primary/10 hover:text-primary font-semibold transition-all duration-200 shadow-sm"
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
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Calculator className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Simule seu Financiamento
              </h2>
              <p className="text-muted-foreground">
                Descubra o valor das parcelas do seu imóvel
              </p>
            </div>

            <Card className="shadow-md border-2 border-border">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyValue" className="text-sm font-semibold text-foreground">
                    Valor do Imóvel
                  </Label>
                  <Input
                    id="propertyValue"
                    type="text"
                    value={propertyValue}
                    onChange={handlePropertyValueChange}
                    placeholder="R$ 0"
                    className="text-lg h-12 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground font-medium placeholder:text-muted-foreground/70 transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="downPayment" className="text-sm font-semibold text-foreground">
                      Entrada (%)
                    </Label>
                    <Input
                      id="downPayment"
                      type="number"
                      min="20"
                      max="90"
                      value={downPaymentPercentage}
                      onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
                      className="h-12 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground font-medium transition-all duration-200"
                    />
                    <p className="text-xs text-muted-foreground font-medium">Mínimo 20%</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="termYears" className="text-sm font-semibold text-foreground">
                      Prazo (anos)
                    </Label>
                    <Input
                      id="termYears"
                      type="number"
                      min="1"
                      max="35"
                      value={termYears}
                      onChange={(e) => setTermYears(Number(e.target.value))}
                      className="h-12 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground font-medium transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="bg-primary/5 border-2 border-primary/30 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-foreground">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Taxa: 12% ao ano (SAC)</span>
                  </div>
                </div>

                <Button 
                  onClick={calculateFinancing} 
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg border-2 border-primary hover:border-primary/80 transition-all duration-200"
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
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Resultado da Simulação
              </h2>
              <p className="text-muted-foreground">
                Confira os detalhes do seu financiamento
              </p>
            </div>

            <Card className="shadow-md border-2 border-border">
              <CardContent className="p-6 space-y-6">
                {/* Valor da Parcela - Destaque */}
                <div className="bg-primary/5 border-2 border-primary/30 p-6 rounded-lg text-center shadow-sm">
                  <p className="text-sm text-muted-foreground mb-2 font-semibold">
                    Primeira Parcela (SAC)
                  </p>
                  <p className="text-4xl font-bold text-primary mb-2">
                    {formatCurrency(result.monthlyPayment)}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    As parcelas diminuem mensalmente
                  </p>
                  {simulationSaved && (
                    <div className="mt-3 flex items-center justify-center text-green-600 text-sm font-semibold bg-green-50 border-2 border-green-200 rounded-md p-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Simulação salva automaticamente
                    </div>
                  )}
                </div>

                <Separator className="border-t-2 border-border" />

                {/* Detalhes do Financiamento */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-card border-2 border-border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-sm text-muted-foreground mb-1 font-semibold">Valor da Entrada</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(result.downPayment)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {downPaymentPercentage}% do valor do imóvel
                    </p>
                  </div>

                  <div className="bg-card border-2 border-border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-sm text-muted-foreground mb-1 font-semibold">Valor Financiado</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(result.financedAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      Em {termYears} anos ({termYears * 12} parcelas)
                    </p>
                  </div>

                  <div className="bg-card border-2 border-border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-sm text-muted-foreground mb-1 font-semibold">Total de Juros</p>
                    <p className="text-xl font-bold text-destructive">
                      {formatCurrency(result.totalInterest)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      12% ao ano
                    </p>
                  </div>

                  <div className="bg-card border-2 border-border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <p className="text-sm text-muted-foreground mb-1 font-semibold">Total a Pagar</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(result.totalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      Financiamento + Juros
                    </p>
                  </div>
                </div>

                <Separator className="border-t-2 border-border" />

                {/* Resumo */}
                <div className="bg-muted/50 border-2 border-border p-4 rounded-lg">
                  <h4 className="font-bold text-foreground mb-3">
                    Resumo do Financiamento
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Valor do imóvel:</span>
                      <span className="font-bold text-foreground">{propertyValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Entrada ({downPaymentPercentage}%):</span>
                      <span className="font-bold text-foreground">{formatCurrency(result.downPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Prazo:</span>
                      <span className="font-bold text-foreground">{termYears} anos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-semibold">Sistema:</span>
                      <span className="font-bold text-foreground">SAC (parcelas decrescentes)</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button 
                    onClick={resetSimulation} 
                    variant="outline"
                    className="h-12 font-semibold border-2 border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 shadow-sm"
                  >
                    Nova Simulação
                  </Button>
                  <Button 
                    onClick={handleAcceptProposal}
                    className="h-12 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg border-2 border-primary hover:border-primary/80 transition-all duration-200"
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