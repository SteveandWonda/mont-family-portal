import Header from './components/Header'
import FilesWidget from './components/FilesWidget'
import YNABWidget from './components/YNABWidget'
import GiteaWidget from './components/GiteaWidget'
import EmailWidget from './components/EmailWidget'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <FilesWidget />
          <YNABWidget />
          <GiteaWidget />
          <EmailWidget />
        </div>
      </main>
    </div>
  )
}
