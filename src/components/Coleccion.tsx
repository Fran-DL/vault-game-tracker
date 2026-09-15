import { useMemo, useState } from 'react'
import { useLibraryStore } from '@/store'
import type { Juego } from '@/types'
import { ColeccionCard } from '@/components/ColeccionCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CriterioOrden = 'reciente' | 'alfabetico' | 'puntuacion' | 'año'

const OPCIONES_ORDEN: { valor: CriterioOrden; etiqueta: string }[] = [
  { valor: 'reciente', etiqueta: 'Agregados recientemente' },
  { valor: 'alfabetico', etiqueta: 'Alfabético (A-Z)' },
  { valor: 'puntuacion', etiqueta: 'Puntuación' },
  { valor: 'año', etiqueta: 'Año de lanzamiento' },
]

/** Ordena una copia del array de juegos según el criterio elegido. */
function ordenarJuegos(juegos: Juego[], criterio: CriterioOrden): Juego[] {
  const copia = [...juegos]

  switch (criterio) {
    case 'alfabetico':
      return copia.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
    case 'puntuacion':
      // Los sin puntuar (null) quedan al final.
      return copia.sort((a, b) => (b.calificacion ?? -1) - (a.calificacion ?? -1))
    case 'año':
      return copia.sort((a, b) => b.año - a.año)
    case 'reciente':
    default:
      return copia.sort(
        (a, b) => new Date(b.fechaAgregado).getTime() - new Date(a.fechaAgregado).getTime()
      )
  }
}

/**
 * Colección (`/coleccion`): grid de carátulas con todos los juegos logueados
 * (cualquier estado distinto de 'Backlog'), ordenable por fecha, alfabético,
 * puntuación o año. Clickear una carátula abre el modal de edición del log,
 * igual que en el timeline de Home.
 */
export default function Coleccion() {
  const juegos = useLibraryStore((state) => state.juegos)
  const [criterio, setCriterio] = useState<CriterioOrden>('reciente')

  const logueados = useMemo(() => {
    const filtrados = juegos.filter((juego) => juego.estado !== 'Backlog')
    return ordenarJuegos(filtrados, criterio)
  }, [juegos, criterio])

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Colección</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {logueados.length} juego{logueados.length === 1 ? '' : 's'} logueado
            {logueados.length === 1 ? '' : 's'}.
          </p>
        </div>

        {logueados.length > 0 && (
          <Select
            value={criterio}
            onValueChange={(valor) => setCriterio(valor as CriterioOrden)}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPCIONES_ORDEN.map((opcion) => (
                <SelectItem key={opcion.valor} value={opcion.valor}>
                  {opcion.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {logueados.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Todavía no logueaste ningún juego. Empezá alguno desde tu Backlog.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {logueados.map((juego) => (
            <ColeccionCard key={juego.id} juego={juego} />
          ))}
        </div>
      )}
    </div>
  )
}
