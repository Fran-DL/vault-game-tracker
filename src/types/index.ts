/**
 * Estados posibles de un juego dentro de la biblioteca del usuario.
 */
export type EstadoJuego = 'Backlog' | 'Jugando' | 'Completado' | 'Abandonado'

/**
 * Modelo principal de datos: un juego dentro de la biblioteca personal.
 *
 * Los campos `id`, `titulo`, `caratula`, `año` y `generos` provienen de IGDB.
 * El resto de los campos son gestionados por el usuario dentro de la app.
 */
export interface Juego {
  /** ID de IGDB */
  id: number
  titulo: string
  /** URL de la imagen, preferiblemente en formato "cover_big" */
  caratula: string
  año: number
  generos: string[]

  // Campos del usuario
  estado: EstadoJuego
  /** 1-10, null si no fue puntuado */
  calificacion: number | null
  reseña: string
  /** Formato YYYY-MM, cadena vacía si no fue definida por el usuario */
  fechaInicio: string
  /** Formato YYYY-MM, null si está en curso */
  fechaFin: string | null
  logrosCompletos: boolean
  vecesRejugado: number
  esFavorito: boolean
  /**
   * ISO timestamp generado automáticamente al añadir el juego por primera vez.
   * Nunca debe modificarse posteriormente.
   */
  fechaAgregado: string
}

/**
 * Datos del perfil del usuario, persistidos en localStorage.
 */
export interface Perfil {
  nombreUsuario: string
  biografia: string
  /** Imagen de perfil codificada en Base64, null si se usa el avatar por defecto */
  fotoBase64: string | null
}

/**
 * Nombres de color soportados por el selector de personalización.
 */
export type NombreColorPrimario = 'Violeta' | 'Naranja' | 'Azul' | 'Verde'

export interface OpcionColorPrimario {
  nombre: NombreColorPrimario
  /** Valor hexadecimal, ej. "#7C3AED" */
  hex: string
  /** Mismo color expresado en "H S% L%" para la variable CSS --primary */
  hsl: string
}

// ---------------------------------------------------------------------------
// Tipos relacionados con IGDB
// ---------------------------------------------------------------------------

/**
 * Forma cruda (parcial) de un juego tal como lo devuelve la API de IGDB.
 * Se utiliza como paso intermedio antes de mapear a `Juego`.
 */
export interface IGDBJuegoCrudo {
  id: number
  name: string
  cover?: {
    id: number
    image_id: string
    url?: string
  }
  first_release_date?: number
  genres?: { id: number; name: string }[]
  platforms?: { id: number; name: string }[]
  screenshots?: { id: number; image_id: string }[]
  videos?: { id: number; video_id: string; name?: string }[]
  total_rating?: number
  total_rating_count?: number
  rating?: number
  hypes?: number
  summary?: string
}

/**
 * Resultado ya normalizado de una búsqueda o de la lista Top 100,
 * antes de que el usuario decida agregarlo a su biblioteca.
 */
export interface ResultadoBusquedaJuego {
  id: number
  titulo: string
  caratula: string
  año: number | null
  generos: string[]
}

export interface TokenTwitch {
  access_token: string
  expires_in: number
  token_type: string
}

/**
 * Estructura de la caché del Top 100 almacenada en localStorage.
 */
export interface CacheTop100 {
  juegos: ResultadoBusquedaJuego[]
  timestamp: number
}

/**
 * Captura de pantalla de un juego, en dos tamaños: miniatura (para la
 * galería horizontal) y grande (para el lightbox al hacer click).
 */
export interface CapturaJuego {
  urlMiniatura: string
  urlGrande: string
}

/**
 * Detalle completo de un juego obtenido de IGDB para la vista `/juego/:id`.
 * A diferencia de `ResultadoBusquedaJuego`, incluye resumen, plataformas
 * y medios (video + capturas) para la galería.
 */
export interface DetalleJuegoCompleto {
  id: number
  titulo: string
  caratula: string
  año: number | null
  generos: string[]
  plataformas: string[]
  resumen: string
  capturas: CapturaJuego[]
  /** id de YouTube del primer video encontrado, o null si no hay. */
  idVideo: string | null
}

/**
 * Duración estimada de un juego según IGDB (endpoint `game_time_to_beats`),
 * convertida a horas. `null` en un campo significa que IGDB no tiene ese dato.
 */
export interface DuracionJuego {
  /** Yendo directo a la historia principal. */
  apurado: number | null
  /** A ritmo normal. */
  normal: number | null
  /** Completando el juego al 100%. */
  completo: number | null
}
