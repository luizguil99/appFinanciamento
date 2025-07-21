import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { PenTool, RotateCcw, Download, FileText } from 'lucide-react'

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (signatureData: SignatureData) => void
}

interface SignatureData {
  name: string
  cpf: string
  signature: string
  date: string
}

function SignatureModal({ isOpen, onClose, onConfirm }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [hasSignature, setHasSignature] = useState(false)

  const formatCpf = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value)
    setCpf(formatted)
  }

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    // Estilo da linha
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Fundo branco
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasSignature(true)
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let x, y
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let x, y
    if ('touches' in e) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleConfirm = () => {
    if (!name.trim() || !cpf.trim() || !hasSignature) {
      alert('Por favor, preencha todos os campos e assine o documento.')
      return
    }

    if (cpf.replace(/\D/g, '').length !== 11) {
      alert('Por favor, digite um CPF válido.')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const signatureDataUrl = canvas.toDataURL('image/png')
    const currentDate = new Date().toLocaleDateString('pt-BR')

    const signatureData: SignatureData = {
      name: name.trim(),
      cpf: cpf.trim(),
      signature: signatureDataUrl,
      date: currentDate
    }

    onConfirm(signatureData)
  }

  const handleClose = () => {
    setName('')
    setCpf('')
    setHasSignature(false)
    clearCanvas()
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(initCanvas, 100)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Assinatura Digital da Proposta</span>
          </DialogTitle>
          <DialogDescription>
            Para finalizar sua proposta, preencha seus dados e assine digitalmente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Área de Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <PenTool className="h-5 w-5" />
                <span>Assinatura Digital</span>
              </CardTitle>
              <CardDescription>
                Desenhe sua assinatura na área abaixo usando o mouse ou toque
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-white cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-muted-foreground">
                      <PenTool className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Assine aqui</p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={clearCanvas}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar Assinatura
              </Button>
            </CardContent>
          </Card>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
              disabled={!name.trim() || !cpf.trim() || !hasSignature}
            >
              <Download className="h-4 w-4 mr-2" />
              Aceitar e Baixar PDF
            </Button>
          </div>

          {/* Aviso Legal */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Aviso:</strong> Ao assinar digitalmente, você declara estar ciente das condições 
              da proposta e concorda com os termos apresentados. Esta assinatura tem validade legal 
              conforme a legislação brasileira sobre documentos eletrônicos.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SignatureModal 