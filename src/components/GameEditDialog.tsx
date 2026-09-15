import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Trophy,
  Heart,
  Trash,
  RotateCcw,
  Star,
  X as IconoQuitar,
} from 'lucide-react'
import { useLibraryStore, MAX_FAVORITOS } from '@/store'
import { useGameEditDialogStore } from '@/store/useGameEditDialogStore'
import type { EstadoJuego } from '@/types'
import { ESTADOS_JUEGO } from '@/lib/estados'
import { mesActual, formatearFechaAgregado } from '@/lib/fecha'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Modal de edición de juego (Fase 4).
 *
 * Se monta una única vez en `App.tsx` y su visibilidad depende enteramente
 * de `useGameEditDialogStore`: cualquier pantalla puede abrirlo llamando a
 * `abrirEdicionJuego(id)` sin tener que renderizar este componente ella misma.
 *
 * `vecesRejugado` y `esFavorito` se leen y mutan directamente contra el store
 * de biblioteca (son acciones inmediatas, como en Backlog/Top100). El resto
 * de los campos vive en estado local del formulario y solo se persiste al
 * presionar "Guardar cambios".
 */
export function GameEditDialog() {
  const idJuegoAbierto = useGameEditDialogStore((state) => state.idJuegoAbierto)
  const cerrar = useGameEditDialogStore((state) => state.cerrar)

  const juego = useLibraryStore((state) =>
    state.juegos.find((j) => j.id === idJuegoAbierto)
  )
  const actualizarJuego = useLibraryStore((state) => state.actualizarJuego)
  const eliminarJuego = useLibraryStore((state) => state.eliminarJuego)
  const incrementarRejugado = useLibraryStore((state) => state.incrementarRejugado)
  const toggleFavorito = useLibraryStore((state) => state.toggleFavorito)

  const abierto = idJuegoAbierto !== null && Boolean(juego)

  // --- Estado local del formulario -----------------------------------------
  const [estado, setEstado] = useState<EstadoJuego>('Backlog')
  const [calificacion, setCalificacion] = useState<number | null>(null)
  const [reseña, setReseña] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [enCurso, setEnCurso] = useState(true)
  const [logrosCompletos, setLogrosCompletos] = useState(false)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)

  // Repobla el formulario cada vez que se abre un juego distinto.
  useEffect(() => {
    if (!juego) return
    setEstado(juego.estado)
    setCalificacion(juego.calificacion)
    setReseña(juego.reseña)
    setFechaInicio(juego.fechaInicio)
    setFechaFin(juego.fechaFin ?? '')
    setEnCurso(juego.fechaFin === null)
    setLogrosCompletos(juego.logrosCompletos)
    setConfirmandoEliminar(false)
    // Solo queremos re-poblar al cambiar de juego, no en cada tecleo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idJuegoAbierto])

  function manejarCambioAbierto(nuevoAbierto: boolean) {
    if (!nuevoAbierto) cerrar()
  }

  function manejarRejugar() {
    if (!juego) return
    incrementarRejugado(juego.id)
    // Refleja en el formulario lo que la acción acaba de fijar en el store,
    // para que "Guardar cambios" no lo pise con valores viejos.
    setFechaInicio(mesActual())
    setFechaFin('')
    setEnCurso(true)
    toast.success('Rejugada registrada. Se reinició el período de juego.')
  }

  function manejarToggleFavorito() {
    if (!juego) return
    const pudoAlternar = toggleFavorito(juego.id)
    if (!pudoAlternar) {
      toast.warning(`No podés marcar más de ${MAX_FAVORITOS} juegos como favoritos.`)
    }
  }

  function manejarEliminar() {
    if (!juego) return
    if (!confirmandoEliminar) {
      setConfirmandoEliminar(true)
      return
    }
    eliminarJuego(juego.id)
    toast.success(`"${juego.titulo}" se eliminó de tu biblioteca.`)
    cerrar()
  }

  function manejarGuardar() {
    if (!juego) return

    actualizarJuego(juego.id, {
      estado,
      calificacion,
      reseña,
      fechaInicio,
      fechaFin: enCurso ? null : fechaFin || null,
      logrosCompletos,
    })
    toast.success('Cambios guardados.')
    cerrar()
  }

  if (!juego) return null

  return (
    <Dialog open={abierto} onOpenChange={manejarCambioAbierto}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{juego.titulo}</DialogTitle>
          <DialogDescription>
            {juego.año > 0 ? juego.año : 'Año desconocido'}
            {juego.generos.length > 0 ? ` · ${juego.generos.join(', ')}` : ''}
            {' · Agregado: '}
            {formatearFechaAgregado(juego.fechaAgregado)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Carátula grande a la izquierda (en pantallas grandes) */}
          <div className="mx-auto w-40 md:mx-0 md:w-full">
            {juego.caratula ? (
              <img
                src={juego.caratula}
                alt={`Carátula de ${juego.titulo}`}
                className="w-full rounded-lg border border-border object-cover shadow-sm"
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-border bg-secondary text-xs text-muted-foreground">
                Sin carátula
              </div>
            )}
          </div>

          {/* Información y controles a la derecha */}
          <div className="space-y-5">
            {/* Estado */}
            <div className="space-y-1.5">
              <Label htmlFor="estado-juego">Estado</Label>
              <Select value={estado} onValueChange={(valor) => setEstado(valor as EstadoJuego)}>
                <SelectTrigger id="estado-juego">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_JUEGO.map((opcion) => (
                    <SelectItem key={opcion} value={opcion}>
                      {opcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calificación */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Calificación</Label>
                {calificacion !== null && (
                  <button
                    type="button"
                    onClick={() => setCalificacion(null)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <IconoQuitar className="h-3.5 w-3.5" />
                    Quitar calificación
                  </button>
                )}
              </div>
              {calificacion === null ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setCalificacion(5)}>
                  <Star className="h-4 w-4" />
                  Calificar juego
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Slider
                    value={[calificacion]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={([valor]) => setCalificacion(valor)}
                    className="flex-1"
                  />
                  <span className="flex w-14 shrink-0 items-center justify-end gap-1 text-sm font-medium">
                    <Star className="h-4 w-4 text-primary" />
                    {calificacion}/10
                  </span>
                </div>
              )}
            </div>

            {/* Logros completos */}
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={logrosCompletos}
                onCheckedChange={(valor) => setLogrosCompletos(valor === true)}
              />
              <Trophy className="h-4 w-4 text-muted-foreground" />
              Logros completos
            </label>

            {/* Reseña */}
            <div className="space-y-1.5">
              <Label htmlFor="reseña-juego">Reseña</Label>
              <Textarea
                id="reseña-juego"
                value={reseña}
                onChange={(e) => setReseña(e.target.value)}
                placeholder="¿Qué te pareció el juego?"
                rows={4}
              />
            </div>

            {/* Rango de fechas */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fecha-inicio">Fecha de inicio</Label>
                <Input
                  id="fecha-inicio"
                  type="month"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fecha-fin">Fecha de finalización</Label>
                <Input
                  id="fecha-fin"
                  type="month"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  disabled={enCurso}
                />
                <label className="flex cursor-pointer items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <Checkbox
                    checked={enCurso}
                    onCheckedChange={(valor) => {
                      const marcado = valor === true
                      setEnCurso(marcado)
                      if (marcado) setFechaFin('')
                    }}
                  />
                  En curso
                </label>
              </div>
            </div>

            {/* Veces rejugado */}
            <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 px-3 py-2">
              <span className="text-sm">
                Rejugado <span className="font-medium">{juego.vecesRejugado}</span>{' '}
                {juego.vecesRejugado === 1 ? 'vez' : 'veces'}
              </span>
              <Button type="button" variant="outline" size="sm" onClick={manejarRejugar}>
                <RotateCcw className="h-4 w-4" />
                +1 Rejugado
              </Button>
            </div>

            {/* Favorito */}
            <Button
              type="button"
              variant={juego.esFavorito ? 'default' : 'outline'}
              className="w-full"
              onClick={manejarToggleFavorito}
            >
              <Heart className={cn('h-4 w-4', juego.esFavorito && 'fill-current')} />
              {juego.esFavorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
            </Button>
          </div>
        </div>

        <DialogFooter className="border-t border-border pt-4">
          {confirmandoEliminar ? (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-destructive-foreground">
                ¿Eliminar "{juego.titulo}" de tu biblioteca? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmandoEliminar(false)}>
                  Cancelar
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={manejarEliminar}>
                  <Trash className="h-4 w-4" />
                  Sí, eliminar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={manejarEliminar} className="sm:mr-auto">
                <Trash className="h-4 w-4" />
                Eliminar juego
              </Button>
              <Button type="button" variant="ghost" onClick={cerrar}>
                Cancelar
              </Button>
              <Button type="button" onClick={manejarGuardar}>
                Guardar cambios
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
