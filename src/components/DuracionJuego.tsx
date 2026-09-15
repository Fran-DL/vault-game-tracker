import { Zap, Gamepad2, Trophy } from 'lucide-react'
import { useDuracionJuego } from '@/hooks/useDuracionJuego'
import { cn } from '@/lib/utils'

interface DuracionJuegoProps {
  idJuego: number
}

interface EstadisticaDuracion {
  etiqueta: string
  valor: number
  Icono: typeof Zap
  claseColor: string
}

/** grid-cols-{1,2,3} como clases literales para que Tailwind las detecte. */
const CLASE_COLUMNAS = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3'] as const

function formatearHoras(horas: number): string {
  return `${horas}h`
}

/**
 * Duración estimada según IGDB (`game_time_to_beats`), mostrada como
 * cuadritos de estadística en la vista de detalle del juego, debajo de
 * la galería de medios. No renderiza nada si IGDB no tiene datos para
 * ninguna de las tres categorías.
 */
export function DuracionJuego({ idJuego }: DuracionJuegoProps) {
  const { duracion, cargando } = useDuracionJuego(idJuego)

  if (cargando) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-lg bg-secondary" />
        ))}
      </div>
    )
  }

  if (!duracion) return null

  const estadisticas: EstadisticaDuracion[] = [
    duracion.apurado !== null && {
      etiqueta: 'Rush',
      valor: duracion.apurado,
      Icono: Zap,
      claseColor: 'border-amber-600/40 bg-amber-600/10 text-amber-400',
    },
    duracion.normal !== null && {
      etiqueta: 'Normal',
      valor: duracion.normal,
      Icono: Gamepad2,
      claseColor: 'border-primary/40 bg-primary/10 text-primary',
    },
    duracion.completo !== null && {
      etiqueta: 'Completista',
      valor: duracion.completo,
      Icono: Trophy,
      claseColor: 'border-emerald-600/40 bg-emerald-600/10 text-emerald-400',
    },
  ].filter((estadistica): estadistica is EstadisticaDuracion => Boolean(estadistica))

  if (estadisticas.length === 0) return null

  return (
    <div className={cn('grid gap-3', CLASE_COLUMNAS[estadisticas.length])}>
      {estadisticas.map(({ etiqueta, valor, Icono, claseColor }) => (
        <div
          key={etiqueta}
          className={cn(
            'flex flex-col items-center justify-center gap-1 rounded-lg border py-3 text-center',
            claseColor
          )}
        >
          <Icono className="h-4 w-4" />
          <span className="text-lg font-semibold leading-none">{formatearHoras(valor)}</span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {etiqueta}
          </span>
        </div>
      ))}
    </div>
  )
}