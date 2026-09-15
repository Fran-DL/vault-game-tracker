import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/Navbar'
import { GameEditDialog } from '@/components/GameEditDialog'
import Home from '@/components/Home'
import Backlog from '@/components/Backlog'
import Coleccion from '@/components/Coleccion'
import Top100 from '@/components/Top100'
import Perfil from '@/components/Perfil'
import Dev from '@/components/Dev'
import GameDetail from '@/components/GameDetail'
import Configuracion from '@/components/Configuracion'

/**
 * Layout raíz: Navbar fija (Fase 6, reemplaza la nav temporal de la Fase 5),
 * modal de edición y Toaster montados una única vez, y las rutas de la app.
 * /top100 y /perfil son placeholders hasta las Fases 7 y 8; /dev sigue
 * disponible para pruebas manuales.
 */
function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" richColors position="bottom-right" />
      <GameEditDialog />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/backlog" element={<Backlog />} />
        <Route path="/coleccion" element={<Coleccion />} />
        <Route path="/top100" element={<Top100 />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/dev" element={<Dev />} />
        <Route path="/juego/:id" element={<GameDetail />} />
      </Routes>
    </div>
  )
}

export default App