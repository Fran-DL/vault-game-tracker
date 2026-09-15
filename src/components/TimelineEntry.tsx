import { useState } from 'react'
import { Star } from 'lucide-react'
import type { Juego } from '@/types'
import { abrirEdicionJuego } from '@/store/useGameEditDialogStore'
import { formatearFechaAgregado, formatearPeriodoJuego } from '@/lib/fecha'
import { varianteBadgeEstado } from '@/lib/estado-badge'
import { Badge } from '@/components/ui/badge'

/** A partir de este largo, la reseña se trunca y se ofrece "Ver más". */
const LARGO_MAXIMO_RESEÑA = 200

interface TimelineEntryProps {
  juego: Juego
}

/**
 * Una entrada del timeline vertical de Home. Todo el bloque es clickeable
 * y abre el modal de edición; el botón "Ver más" corta la propagación del
 * click para no disparar la apertura del modal al expandir la reseña.
 */
export function TimelineEntry({ juego }: TimelineEntryProps) {
  const [reseñaExpandida, setReseñaExpandida] = useState(false)

  const reseñaLarga = juego.reseña.length > LARGO_MAXIMO_RESEÑA
  const reseñaAMostrar =
    reseñaLarga && !reseñaExpandida
      ? `${juego.reseña.slice(0, LARGO_MAXIMO_RESEÑA)}…`
      : juego.reseña

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => abrirEdicionJuego(juego.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') abrirEdicionJuego(juego.id)
      }}
      className="relative z-10 grid min-w-0 grid-cols-[72px_20px_minmax(0,1fr)] gap-x-3"
    >
      <time className="flex items-center justify-end text-right text-xs font-medium text-muted-foreground">
        {formatearFechaAgregado(juego.fechaAgregado)}
      </time>

      <div className="relative flex self-stretch items-center justify-center" aria-hidden="true">
        <span className="h-3 w-3 rounded-full border-2 border-background bg-primary ring-1 ring-primary/40" />
      </div>

      <div className="flex min-w-0 cursor-pointer gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
        {juego.caratula ? (
          <img
            src={juego.caratula}
            alt={`Carátula de ${juego.titulo}`}
            className="h-28 w-20 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-md bg-secondary text-[10px] text-muted-foreground">
            Sin carátula
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-medium leading-tight">{juego.titulo}</h3>
            <Badge variant={varianteBadgeEstado(juego.estado)}>{juego.estado}</Badge>
          </div>

          {juego.calificacion !== null && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-primary" />
              {juego.calificacion}/10
            </p>
          )}

          {juego.reseña && (
            <p className="text-sm text-muted-foreground">
              {reseñaAMostrar}
              {reseñaLarga && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setReseñaExpandida((valor) => !valor)
                  }}
                  className="ml-1 font-medium text-primary hover:underline"
                >
                  {reseñaExpandida ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </p>
          )}

          {juego.fechaInicio && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
              <span>Jugado: {formatearPeriodoJuego(juego.fechaInicio, juego.fechaFin)}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
