import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, User, House, ListChecks, LayoutGrid, Trophy, UserCircle, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { useLibraryStore, useProfileStore } from '@/store'
import { abrirEdicionJuego } from '@/store/useGameEditDialogStore'
import { useDebounce } from '@/hooks/useDebounce'
import { buscarJuegos, ErrorServicioIGDB } from '@/services'
import type { ResultadoBusquedaJuego } from '@/types'
import { SearchResultsDropdown } from '@/components/SearchResultsDropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ENLACES_PERFIL = [
  { to: '/', etiqueta: 'Home', icono: House, fin: true },
  { to: '/perfil', etiqueta: 'Perfil', icono: UserCircle, fin: false },
  { to: '/coleccion', etiqueta: 'Colección', icono: LayoutGrid, fin: false },
  { to: '/backlog', etiqueta: 'Backlog', icono: ListChecks, fin: false },
  { to: '/configuracion', etiqueta: 'Configuración', icono: Settings, fin: false },
] as const

/**
 * Barra de navegación fija (Fase 6): reemplaza la nav temporal de la Fase 5.
 *
 * El buscador del centro pega contra IGDB real con debounce (400ms), muestra
 * estados de carga/error, y detecta juegos ya añadidos. Seleccionar un
 * resultado agrega el juego a la biblioteca (si no existía) y abre el modal
 * de edición global, igual que en Backlog/Top100.
 */
export function Navbar() {
  const navigate = useNavigate()
  const contenedorRef = useRef<HTMLDivElement>(null)

  const existeJuego = useLibraryStore((state) => state.existeJuego)
  const fotoBase64 = useProfileStore((state) => state.fotoBase64)
  const nombreUsuario = useProfileStore((state) => state.nombreUsuario)

  const [termino, setTermino] = useState('')
  const [dropdownAbierto, setDropdownAbierto] = useState(false)
  const [resultados, setResultados] = useState<ResultadoBusquedaJuego[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const terminoDebounced = useDebounce(termino.trim(), 400)

  // Cierra el dropdown al hacer click afuera del buscador.
  useEffect(() => {
    function manejarClickAfuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setDropdownAbierto(false)
      }
    }
    document.addEventListener('mousedown', manejarClickAfuera)
    return () => document.removeEventListener('mousedown', manejarClickAfuera)
  }, [])

  // Dispara la búsqueda contra IGDB cuando cambia el término debounced.
  useEffect(() => {
    if (!terminoDebounced) {
      setResultados([])
      setError(null)
      setCargando(false)
      return
    }

    let cancelado = false
    setCargando(true)
    setError(null)

    buscarJuegos(terminoDebounced)
      .then((juegos) => {
        if (!cancelado) setResultados(juegos)
      })
      .catch((err) => {
        if (cancelado) return
        setResultados([])
        setError(
          err instanceof ErrorServicioIGDB
            ? err.message
            : 'Ocurrió un error inesperado al buscar juegos.'
        )
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [terminoDebounced])

  function manejarSeleccion(juego: ResultadoBusquedaJuego) {
    setDropdownAbierto(false)
    setTermino('')
    navigate(`/juego/${juego.id}`)
  }

  const mostrarDropdown = dropdownAbierto && termino.trim().length > 0

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        {/* Izquierda: logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <img
            src="/logo.png"
            alt="Vault - Game Tracker"
            className="h-8 w-8 object-contain"
          />
          <span className="hidden sm:inline">Vault - Game Tracker</span>
        </Link>

        {/* Centro: buscador global */}
        <div ref={contenedorRef} className="relative mx-auto w-full max-w-md flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={termino}
              onChange={(e) => {
                setTermino(e.target.value)
                setDropdownAbierto(true)
              }}
              onFocus={() => setDropdownAbierto(true)}
              type="text"
              placeholder="Buscar un juego…"
              className="h-10 w-full rounded-md border border-input bg-secondary/40 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          <SearchResultsDropdown
            visible={mostrarDropdown}
            cargando={cargando}
            error={error}
            resultados={resultados}
            existeJuego={existeJuego}
            onSeleccionar={manejarSeleccion}
          />
        </div>

        {/* Derecha: acceso al Top 100 y avatar de perfil */}
        <NavLink
          to="/top100"
          aria-label="Top 100"
          title="Top 100"
          className={({ isActive }) =>
            `flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors ${
              isActive
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
            }`
          }
        >
          <Trophy className="h-5 w-5" />
          <span>Top 100</span>
        </NavLink>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary transition-colors hover:bg-accent"
            >
              {fotoBase64 ? (
                <img src={fotoBase64} alt="Tu perfil" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{nombreUsuario || 'Tu perfil'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ENLACES_PERFIL.map((enlace) => (
              <DropdownMenuItem key={enlace.to} asChild>
                <NavLink
                  to={enlace.to}
                  end={enlace.fin}
                  className={({ isActive }) =>
                    isActive ? 'flex items-center gap-2 text-primary' : 'flex items-center gap-2'
                  }
                >
                  <enlace.icono className="h-4 w-4" />
                  {enlace.etiqueta}
                </NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}