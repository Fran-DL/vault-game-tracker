import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import type { Juego } from '@/types'
import { useLibraryStore } from '@/store'
import { Button } from '@/components/ui/button'

interface GameCardProps {
  juego: Juego
}

/**
 * Tarjeta de juego usada en el grid de Backlog. Clickear la tarjeta navega
 * a la vista detallada (`/juego/:id`); el botón "Empezar" corta la
 * propagación para no disparar también la navegación.
 */
export function GameCard({ juego }: GameCardProps) {
  const navigate = useNavigate()
  const empezarJuego = useLibraryStore((state) => state.empezarJuego)

  function manejarClickTarjeta() {
    navigate(`/juego/${juego.id}`)
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={manejarClickTarjeta}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') manejarClickTarjeta()
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
    >
      {juego.caratula ? (
        <img
          src={juego.caratula}
          alt={`Carátula de ${juego.titulo}`}
          className="aspect-[3/4] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[3/4] w-full items-center justify-center bg-secondary text-xs text-muted-foreground">
          Sin carátula
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">{juego.titulo}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {juego.año > 0 ? juego.año : 'Año desconocido'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-auto"
          onClick={(e) => {
            e.stopPropagation()
            empezarJuego(juego.id)
          }}
        >
          <Play className="h-3.5 w-3.5" />
          Empezar
        </Button>
      </div>
    </article>
  )
}
