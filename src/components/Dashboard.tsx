import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  email: string
  name: string
  created_at: string
}

function Dashboard() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          setProfile(data)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo ao seu painel de financiamento, {profile?.name || user?.email}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sair
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
              <CardDescription>Suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {profile?.name || 'Não informado'}</p>
                <p><strong>Email:</strong> {profile?.email || user?.email}</p>
                <p><strong>Membro desde:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                <p><strong>ID:</strong> {user?.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financiamentos</CardTitle>
              <CardDescription>Seus projetos de financiamento</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nenhum financiamento encontrado. Crie seu primeiro projeto!
              </p>
              <Button className="w-full mt-4">
                Novo Financiamento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>Resumo da sua atividade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Projetos:</strong> 0</p>
                <p><strong>Total Arrecadado:</strong> R$ 0,00</p>
                <p><strong>Apoiadores:</strong> 0</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
            <CardDescription>O que você pode fazer agora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button className="h-auto p-4 text-left" variant="outline">
                <div>
                  <h3 className="font-semibold">Criar Projeto</h3>
                  <p className="text-sm text-muted-foreground">
                    Comece seu primeiro projeto de financiamento
                  </p>
                </div>
              </Button>
              <Button className="h-auto p-4 text-left" variant="outline">
                <div>
                  <h3 className="font-semibold">Explorar Projetos</h3>
                  <p className="text-sm text-muted-foreground">
                    Descubra e apoie outros projetos
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard 