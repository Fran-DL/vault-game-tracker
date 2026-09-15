import { Star } from 'lucide-react'
import type { Juego } from '@/types'
import { abrirEdicionJuego } from '@/store/useGameEditDialogStore'
import { varianteBadgeEstado } from '@/lib/estado-badge'
import { Badge } from '@/components/ui/badge'

interface ColeccionCardProps {
  juego: Juego
}

/**
 * Tarjeta de juego usada en el grid de Colección. A diferencia de GameCard
 * (que navega al detalle), clickear la tarjeta abre directamente el modal
 * de edición del log, igual que las entradas del timeline de Home.
 */
export function ColeccionCard({ juego }: ColeccionCardProps) {
  function manejarClickTarjeta() {
    abrirEdicionJuego(juego.id)
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

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">{juego.titulo}</h3>
          <Badge variant={varianteBadgeEstado(juego.estado)} className="shrink-0">
            {juego.estado}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          {juego.año > 0 ? juego.año : 'Año desconocido'}
        </p>

        {juego.calificacion !== null && (
          <p className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-primary" />
            {juego.calificacion}/10
          </p>
        )}
      </div>
    </article>
  )
}
