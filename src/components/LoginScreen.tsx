import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'

function LoginScreen() {
  const { signIn, signUp, loading } = useAuth()
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signIn(loginData.email, loginData.password)
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Login realizado com sucesso!')
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (registerData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(
        registerData.email, 
        registerData.password, 
        registerData.name
      )
      
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Conta criada com sucesso! Verifique seu email para confirmar.')
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' })
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Left Column - Forms */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2 text-center">
                  <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                  <p className="text-muted-foreground">
                    Digite suas credenciais para acessar sua conta
                  </p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="seu@email.com" 
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Digite sua senha" 
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading || loading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              {/* Registration Form */}
              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2 text-center">
                  <h1 className="text-2xl font-bold">Crie sua conta</h1>
                  <p className="text-muted-foreground">
                    Preencha os campos abaixo para se cadastrar
                  </p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input 
                      id="name" 
                      placeholder="Seu nome completo" 
                      value={registerData.name}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      placeholder="Crie uma senha (min. 6 caracteres)" 
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar senha</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      placeholder="Confirme sua senha" 
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading || loading}>
                    {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column - Quote */}
        <div className="hidden lg:flex flex-col justify-end p-8 bg-gradient-to-br from-green-100 via-emerald-50 to-green-200 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-transparent to-emerald-100/60"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-300/25 to-transparent rounded-full blur-2xl"></div>
          
          <blockquote className="space-y-3 relative z-10">
            <p className="text-xl font-medium text-green-800 leading-relaxed">
              &ldquo;Transforme suas ideias em realidade com nossa plataforma de financiamento.&rdquo;
            </p>
            <footer className="text-sm font-light text-green-700/80">
              - Equipe de Desenvolvimento
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen 