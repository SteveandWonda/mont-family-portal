import { AuthProvider, useAuth } from './auth'
import Header from './components/Header'
import LoginPage from './components/LoginPage'
import ProjectsWidget from './components/ProjectsWidget'
import FilesWidget from './components/FilesWidget'
import YNABWidget from './components/YNABWidget'
import GiteaWidget from './components/GiteaWidget'
import EmailWidget from './components/EmailWidget'
import CalendarWidget from './components/CalendarWidget'

function Dashboard() {
  const { session } = useAuth()
  if (!session) return <LoginPage />

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <ProjectsWidget />
          <CalendarWidget />
          <FilesWidget />
          <YNABWidget />
          <GiteaWidget />
          <EmailWidget />
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  )
}
