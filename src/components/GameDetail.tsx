import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Plus,
  Check,
  NotebookPen,
  Star,
  Trophy,
  Heart,
  AlertCircle,
} from 'lucide-react'
import { useLibraryStore } from '@/store'
import { abrirEdicionJuego } from '@/store/useGameEditDialogStore'
import { obtenerDetalleCompletoJuego, ErrorServicioIGDB } from '@/services'
import type { DetalleJuegoCompleto } from '@/types'
import { formatearPeriodoJuego } from '@/lib/fecha'
import { varianteBadgeEstado } from '@/lib/estado-badge'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GameMediaGallery } from '@/components/GameMediaGallery'
import { DuracionJuego } from '@/components/DuracionJuego'

/** Placeholder animado mientras se carga el detalle desde IGDB. */
function EsqueletoDetalle() {
  return (
    <div className="grid animate-pulse gap-8 md:grid-cols-[260px_1fr]">
      <div className="space-y-3">
        <div className="aspect-[3/4] w-full rounded-lg bg-secondary" />
        <div className="h-10 rounded-md bg-secondary" />
        <div className="h-10 rounded-md bg-secondary" />
      </div>
      <div className="space-y-4">
        <div className="h-8 w-2/3 rounded bg-secondary" />
        <div className="h-4 w-1/3 rounded bg-secondary" />
        <div className="h-24 rounded bg-secondary" />
      </div>
    </div>
  )
}

/**
 * Vista de detalle de un juego (`/juego/:id`, se navega acá al clickear un
 * resultado del buscador global o una tarjeta del Top 100).
 *
 * Combina datos de IGDB (nombre, fecha, géneros, plataformas, resumen y
 * galería de medios) con el log del usuario si el juego ya está en su
 * biblioteca. "Agregar al backlog" y "Crear/editar log" son acciones
 * independientes: la primera solo agrega, la segunda agrega (si hace falta)
 * y abre el modal de edición global.
 */
export default function GameDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const idJuego = Number(id)

  const juegoLocal = useLibraryStore((state) => state.juegos.find((j) => j.id === idJuego))
  const agregarJuego = useLibraryStore((state) => state.agregarJuego)

  const [detalle, setDetalle] = useState<DetalleJuegoCompleto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(idJuego)) {
      setError('Id de juego inválido.')
      setCargando(false)
      return
    }

    let cancelado = false
    setCargando(true)
    setError(null)

    obtenerDetalleCompletoJuego(idJuego)
      .then((resultado) => {
        if (!cancelado) setDetalle(resultado)
      })
      .catch((err) => {
        if (cancelado) return
        setError(
          err instanceof ErrorServicioIGDB
            ? err.message
            : 'Ocurrió un error inesperado al cargar el juego.'
        )
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, [idJuego])

  function datosBasicosParaBiblioteca(detalle: DetalleJuegoCompleto) {
    return {
      id: detalle.id,
      titulo: detalle.titulo,
      caratula: detalle.caratula,
      año: detalle.año ?? 0,
      generos: detalle.generos,
    }
  }

  function manejarAgregarBacklog() {
    if (!detalle || juegoLocal) return
    agregarJuego(datosBasicosParaBiblioteca(detalle))
    toast.success(`"${detalle.titulo}" se agregó a tu Backlog.`)
  }

  function manejarAbrirLog() {
    if (!detalle) return
    if (!juegoLocal) agregarJuego(datosBasicosParaBiblioteca(detalle))
    abrirEdicionJuego(detalle.id)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      {cargando && <EsqueletoDetalle />}

      {!cargando && error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!cargando && !error && detalle && (
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          {/* Franja izquierda: carátula + acciones principales */}
          <aside className="space-y-3 md:sticky md:top-20 md:h-fit">
            {detalle.caratula ? (
              <img
                src={detalle.caratula}
                alt={`Carátula de ${detalle.titulo}`}
                className="w-full rounded-lg border border-border object-cover shadow-sm"
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-border bg-secondary text-xs text-muted-foreground">
                Sin carátula
              </div>
            )}

            <Button
              type="button"
              variant={juegoLocal ? 'outline' : 'default'}
              className="w-full"
              onClick={manejarAgregarBacklog}
              disabled={Boolean(juegoLocal)}
            >
              {juegoLocal ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {juegoLocal ? 'Ya está en tu biblioteca' : 'Agregar al backlog'}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={manejarAbrirLog}>
              <NotebookPen className="h-4 w-4" />
              {juegoLocal ? 'Editar log' : 'Crear log'}
            </Button>
          </aside>

          {/* Contenido principal */}
          <div className="min-w-0 space-y-8">
            <header className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">{detalle.titulo}</h1>
              <p className="text-sm text-muted-foreground">
                {detalle.año ?? 'Año desconocido'}
                {detalle.generos.length > 0 ? ` · ${detalle.generos.join(', ')}` : ''}
                {detalle.plataformas.length > 0 ? ` · ${detalle.plataformas.join(', ')}` : ''}
              </p>
              {detalle.resumen && (
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {detalle.resumen}
                </p>
              )}
            </header>

            {/* Log del usuario, solo si el juego ya está en su biblioteca */}
            {juegoLocal && (
              <section className="space-y-3 rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium">Tu log</h2>
                  <Badge variant={varianteBadgeEstado(juegoLocal.estado)}>{juegoLocal.estado}</Badge>
                  {juegoLocal.esFavorito && (
                    <Badge variant="outline" className="gap-1">
                      <Heart className="h-3 w-3 fill-current" />
                      Favorito
                    </Badge>
                  )}
                  {juegoLocal.logrosCompletos && (
                    <Badge variant="outline" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      Logros completos
                    </Badge>
                  )}
                </div>

                {juegoLocal.calificacion !== null && (
                  <p className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-primary" />
                    {juegoLocal.calificacion}/10
                  </p>
                )}

                {juegoLocal.reseña && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{juegoLocal.reseña}</p>
                )}

                {(juegoLocal.fechaInicio || juegoLocal.vecesRejugado > 0) && (
                  <p className="text-xs text-muted-foreground">
                    {juegoLocal.fechaInicio &&
                      `Jugado: ${formatearPeriodoJuego(juegoLocal.fechaInicio, juegoLocal.fechaFin)}`}
                    {juegoLocal.fechaInicio && juegoLocal.vecesRejugado > 0 && ' · '}
                    {juegoLocal.vecesRejugado > 0 &&
                      `Rejugado ${juegoLocal.vecesRejugado} ${juegoLocal.vecesRejugado === 1 ? 'vez' : 'veces'}`}
                  </p>
                )}
              </section>
            )}

            {/* Galería de medios (video + capturas) */}
            <section className="space-y-3">
              <h2 className="font-medium">Galería</h2>
              <GameMediaGallery idVideo={detalle.idVideo} capturas={detalle.capturas} />
            </section>

            {/* Duración estimada (IGDB game_time_to_beats) */}
            <section className="space-y-3">
              <h2 className="font-medium">Duración estimada</h2>
              <DuracionJuego idJuego={detalle.id} />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}