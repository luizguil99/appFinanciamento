import jsPDF from 'jspdf'

interface FinancingData {
  propertyValue: string
  downPayment: number
  financedAmount: number
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
  termYears: number
  downPaymentPercentage: number
  userEmail: string
}

interface SignatureData {
  name: string
  cpf: string
  signature: string
  date: string
}

export const usePdfGenerator = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const generateProposalPdf = (financingData: FinancingData, signatureData: SignatureData) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20
    let yPosition = 30

    // Cabeçalho
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('PROPOSTA DE FINANCIAMENTO IMOBILIÁRIO', pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('SimulaFin - Simulador de Financiamento', pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 20

    // Dados do Cliente
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DADOS DO CLIENTE', margin, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nome: ${signatureData.name}`, margin, yPosition)
    yPosition += 7
    doc.text(`CPF: ${signatureData.cpf}`, margin, yPosition)
    yPosition += 7
    doc.text(`E-mail: ${financingData.userEmail}`, margin, yPosition)
    yPosition += 7
    doc.text(`Data da Proposta: ${signatureData.date}`, margin, yPosition)
    
    yPosition += 20

    // Detalhes do Financiamento
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('DETALHES DO FINANCIAMENTO', margin, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Valor do Imóvel: ${financingData.propertyValue}`, margin, yPosition)
    yPosition += 7
    doc.text(`Entrada (${financingData.downPaymentPercentage}%): ${formatCurrency(financingData.downPayment)}`, margin, yPosition)
    yPosition += 7
    doc.text(`Valor Financiado: ${formatCurrency(financingData.financedAmount)}`, margin, yPosition)
    yPosition += 7
    doc.text(`Prazo: ${financingData.termYears} anos (${financingData.termYears * 12} parcelas)`, margin, yPosition)
    yPosition += 7
    doc.text(`Taxa de Juros: 12% ao ano`, margin, yPosition)
    yPosition += 7
    doc.text(`Sistema: SAC (Sistema de Amortização Constante)`, margin, yPosition)
    
    yPosition += 15

    // Valores em Destaque
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Primeira Parcela: ${formatCurrency(financingData.monthlyPayment)}`, margin, yPosition)
    yPosition += 8
    doc.text(`Total de Juros: ${formatCurrency(financingData.totalInterest)}`, margin, yPosition)
    yPosition += 8
    doc.text(`Total a Pagar: ${formatCurrency(financingData.totalAmount)}`, margin, yPosition)
    
    yPosition += 25

    // Condições
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('CONDIÇÕES GERAIS', margin, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const conditions = [
      '• Esta proposta tem validade de 30 dias a partir da data de emissão.',
      '• A aprovação está sujeita à análise de crédito e documentação.',
      '• As parcelas são decrescentes conforme o Sistema SAC.',
      '• Taxa de juros fixa de 12% ao ano durante todo o período.',
      '• Entrada mínima obrigatória de 20% do valor do imóvel.',
      '• Seguro habitacional obrigatório (valor não incluso na simulação).',
      '• Documentação do imóvel deve estar regularizada.',
      '• Renda comprovada mínima de 3x o valor da primeira parcela.'
    ]

    conditions.forEach(condition => {
      doc.text(condition, margin, yPosition)
      yPosition += 5
    })

    yPosition += 20

    // Assinatura Digital
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ASSINATURA DIGITAL', margin, yPosition)
    yPosition += 15

    // Adicionar a assinatura como imagem se fornecida
    if (signatureData.signature) {
      try {
        doc.addImage(signatureData.signature, 'PNG', margin, yPosition, 80, 30)
        yPosition += 35
      } catch (error) {
        console.error('Erro ao adicionar assinatura:', error)
        yPosition += 10
      }
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Assinado digitalmente por: ${signatureData.name}`, margin, yPosition)
    yPosition += 5
    doc.text(`CPF: ${signatureData.cpf}`, margin, yPosition)
    yPosition += 5
    doc.text(`Data e Hora: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition)

    // Rodapé
    const footerY = doc.internal.pageSize.height - 20
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('Este documento foi gerado digitalmente pelo SimulaFin', pageWidth / 2, footerY, { align: 'center' })
    doc.text('Para dúvidas, entre em contato conosco', pageWidth / 2, footerY + 5, { align: 'center' })

    return doc
  }

  const downloadPdf = (doc: jsPDF, filename: string = 'proposta-financiamento.pdf') => {
    doc.save(filename)
  }

  return {
    generateProposalPdf,
    downloadPdf
  }
} 