import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useSubmissions } from '@/hooks/useSubmissions'
import { type FinancingSubmission } from '@/lib/supabase'
import { 
  Shield, 
  Search, 
  Filter, 
  FileText, 
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  LogOut
} from 'lucide-react'

function AdminPanel() {
  const { user, signOut } = useAuth()
  const { 
    submissions, 
    loading, 
    error, 
    fetchAllSubmissions, 
    updateSubmissionStatus,
    checkIsAdmin 
  } = useSubmissions()

  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [filteredSubmissions, setFilteredSubmissions] = useState<FinancingSubmission[]>([])
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Verificar se é admin e carregar submissões
  useEffect(() => {
    const initializeAdmin = async () => {
      setLoadingAuth(true)
      const adminStatus = await checkIsAdmin()
      setIsAdmin(adminStatus)
      
      if (adminStatus) {
        await fetchAllSubmissions()
      }
      setLoadingAuth(false)
    }

    if (user) {
      initializeAdmin()
    }
  }, [user?.id])

  // Filtrar submissões
  useEffect(() => {
    let filtered = submissions

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(sub => 
        sub.user_name.toLowerCase().includes(term) ||
        sub.user_email.toLowerCase().includes(term) ||
        sub.user_cpf.includes(term) ||
        sub.property_value.toLowerCase().includes(term)
      )
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    setFilteredSubmissions(filtered)
  }, [submissions, searchTerm, statusFilter])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Aprovado', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Rejeitado', variant: 'destructive' as const, icon: XCircle },
      review: { label: 'Em Análise', variant: 'outline' as const, icon: AlertCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 font-medium">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    const success = await updateSubmissionStatus(submissionId, newStatus)
    if (success) {
      // Feedback visual pode ser adicionado aqui se necessário
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // Loading inicial
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Não é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md shadow-md border-2 border-border">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Acesso Negado
            </h2>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <Button 
              onClick={handleSignOut} 
              variant="outline"
              className="font-semibold border-2 border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-200"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg shadow-sm">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Painel Administrativo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gerenciamento de Submissões
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
                <Badge variant="default" className="text-xs font-semibold">
                  Admin
                </Badge>
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="shadow-sm border-2 border-border hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Total</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-2 border-border hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Pendentes</p>
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-2 border-border hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Aprovadas</p>
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-2 border-border hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-semibold">Rejeitadas</p>
                  <p className="text-2xl font-bold">
                    {submissions.filter(s => s.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6 shadow-md border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 font-bold">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search" className="font-semibold text-foreground">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome, email, CPF ou valor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground font-medium placeholder:text-muted-foreground/70 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="font-semibold text-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground font-medium transition-all duration-200">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-border bg-background">
                    <SelectItem value="all" className="font-medium">Todos os status</SelectItem>
                    <SelectItem value="pending" className="font-medium">Pendente</SelectItem>
                    <SelectItem value="review" className="font-medium">Em Análise</SelectItem>
                    <SelectItem value="approved" className="font-medium">Aprovado</SelectItem>
                    <SelectItem value="rejected" className="font-medium">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={fetchAllSubmissions}
                  variant="outline"
                  className="flex items-center space-x-2 font-semibold border-2 border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 shadow-sm"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Submissões */}
        <Card className="shadow-md border-2 border-border">
          <CardHeader>
            <CardTitle className="font-bold">Submissões de Financiamento</CardTitle>
            <CardDescription className="font-medium">
              {filteredSubmissions.length} de {submissions.length} submissões
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4 mb-4">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground font-medium">Carregando submissões...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma submissão encontrada
                </h3>
                <p className="text-muted-foreground font-medium">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros para ver mais resultados.'
                    : 'Ainda não há submissões de financiamento.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-border">
                      <TableHead className="font-bold text-foreground">Cliente</TableHead>
                      <TableHead className="font-bold text-foreground">Valor do Imóvel</TableHead>
                      <TableHead className="font-bold text-foreground">Primeira Parcela</TableHead>
                      <TableHead className="font-bold text-foreground">Status</TableHead>
                      <TableHead className="font-bold text-foreground">Data</TableHead>
                      <TableHead className="font-bold text-foreground">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id} className="border-b border-border hover:bg-muted/50 transition-colors duration-200">
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground">{submission.user_name}</p>
                            <p className="text-sm text-muted-foreground font-medium">
                              {submission.user_email}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">
                              CPF: {formatCpf(submission.user_cpf)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground">{submission.property_value}</p>
                            <p className="text-sm text-muted-foreground font-medium">
                              Entrada: {formatCurrency(submission.down_payment)} ({submission.down_payment_percentage}%)
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-foreground">{formatCurrency(submission.monthly_payment)}</p>
                            <p className="text-sm text-muted-foreground font-medium">
                              {submission.term_years} anos
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(submission.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground font-medium">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(submission.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={submission.status}
                            onValueChange={(value) => handleStatusUpdate(submission.id, value)}
                          >
                            <SelectTrigger className="w-32 border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background text-foreground font-medium transition-all duration-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-border bg-background">
                              <SelectItem value="pending" className="font-medium">Pendente</SelectItem>
                              <SelectItem value="review" className="font-medium">Em Análise</SelectItem>
                              <SelectItem value="approved" className="font-medium">Aprovado</SelectItem>
                              <SelectItem value="rejected" className="font-medium">Rejeitado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default AdminPanel 