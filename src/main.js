import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import './style.css'

const app = document.querySelector('#app')
const isCompactDevice = window.matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)

app.innerHTML = `
  <div class="experience" aria-label="Galaxia floral interactiva para Anna">
    <div id="scene" class="scene"></div>

    <div class="grain" aria-hidden="true"></div>
    <div class="vignette" aria-hidden="true"></div>

    <header class="hud hud--top" id="hudTop">
      <div class="brand">
        <span class="brand__eyebrow">PARA ANNA</span>
        <span class="brand__title">Galaxia Floral</span>
      </div>

      <button class="icon-button" id="infoButton" type="button" aria-label="Abrir mensaje">
        <span>♡</span>
      </button>
    </header>

    <div class="hud hud--bottom" id="hudBottom">
      <div class="interaction-hint">
        <span class="interaction-hint__mouse" aria-hidden="true"></span>
        <span>Arrastra para explorar · rueda para acercarte</span>
      </div>
      <span class="coordinates">A · 2410</span>
    </div>

    <section class="intro" id="intro">
      <div class="intro__orb intro__orb--one" aria-hidden="true"></div>
      <div class="intro__orb intro__orb--two" aria-hidden="true"></div>
      <div class="intro__content">
        <p class="intro__kicker">UN PEQUEÑO UNIVERSO PARA TI</p>
        <h1>Donde el universo<br /><em>también florece.</em></h1>
        <p class="intro__copy">
          Pensé en el espacio que tanto te gusta y en algo que pudiera crecer dentro de él.
          Así nació esta galaxia: miles de flores orbitando solamente para ti.
        </p>
        <button class="enter-button" id="enterButton" type="button">
          <span>Entrar a la galaxia</span>
        </button>
      </div>
    </section>

    <aside class="message-panel" id="messagePanel" aria-hidden="true">
      <button class="message-panel__close" id="closeMessage" type="button" aria-label="Cerrar mensaje">×</button>
      <p class="message-panel__kicker">PARA ANNA</p>
      <h2>Un jardín que no necesitó tierra.</h2>
      <p>
        Si el universo pudiera florecer, me gusta imaginar que se vería un poco así:
        enorme, curioso, lleno de luz y con algo hermoso apareciendo donde uno menos lo espera.
      </p>
      <p>
        No quería regalarte solamente flores. Quería ponerlas en un lugar que también hablara de ti.
      </p>
      <p class="message-panel__signature">— Mijael</p>
    </aside>



    <div class="music-shell" id="musicShell" aria-hidden="true">
      <button class="music-orb" id="musicOrb" type="button" aria-label="Abrir reproductor de música">
        <span class="music-orb__disc" aria-hidden="true"></span>
        <span class="music-orb__note" aria-hidden="true">♫</span>
      </button>

      <section class="music-player" id="musicPlayer" aria-label="Reproductor de la galaxia" aria-hidden="true">
        <div class="music-player__header">
          <div>
            <p class="music-player__kicker">BANDA SONORA DE LA GALAXIA</p>
            <h3 id="trackTitle">Elige cómo empieza este viaje</h3>
            <p id="trackArtist">Tres canciones para acompañar las flores.</p>
          </div>
          <button class="music-player__close" id="closePlayer" type="button" aria-label="Cerrar reproductor">×</button>
        </div>

        <div class="playlist" id="playlist" aria-label="Canciones disponibles"></div>

        <div class="next-up" id="nextUp" aria-live="polite"></div>

        <div class="progress-wrap">
          <input class="track-progress" id="trackProgress" type="range" min="0" max="1000" value="0" aria-label="Progreso de la canción" />
          <div class="progress-times">
            <span id="currentTime">0:00</span>
            <span id="durationTime">0:00</span>
          </div>
        </div>

        <div class="transport">
          <button class="transport__button transport__button--seek" id="rewindTen" type="button" aria-label="Retroceder 10 segundos">−10</button>
          <button class="transport__button" id="prevTrack" type="button" aria-label="Canción anterior">⏮</button>
          <button class="transport__button transport__button--primary" id="playPause" type="button" aria-label="Reproducir">▶</button>
          <button class="transport__button" id="nextTrack" type="button" aria-label="Siguiente canción">⏭</button>
          <button class="transport__button transport__button--seek" id="forwardTen" type="button" aria-label="Adelantar 10 segundos">+10</button>
          <button class="mix-button" id="mixButton" type="button" aria-pressed="false">
            <span>↝</span>
            <span>MIX</span>
          </button>
        </div>

        <div class="volume-row">
          <span class="volume-row__icon" aria-hidden="true">◖</span>
          <input class="volume-slider" id="volumeSlider" type="range" min="0" max="100" value="58" aria-label="Volumen" />
          <span class="volume-row__value" id="volumeValue">58%</span>
        </div>

        <p class="music-player__hint">Puedes escoger cualquier canción primero. En MIX, la galaxia decide el orden y enlaza una con otra.</p>
      </section>
    </div>

    <div class="loading" id="loading" aria-live="polite">
      <div class="loading__flower" aria-hidden="true">✿</div>
      <span>Sembrando estrellas...</span>
    </div>
  </div>
`

const sceneHost = document.querySelector('#scene')
const intro = document.querySelector('#intro')
const enterButton = document.querySelector('#enterButton')
const hudTop = document.querySelector('#hudTop')
const hudBottom = document.querySelector('#hudBottom')
const infoButton = document.querySelector('#infoButton')
const messagePanel = document.querySelector('#messagePanel')
const closeMessage = document.querySelector('#closeMessage')
const loading = document.querySelector('#loading')

const musicShell = document.querySelector('#musicShell')
const musicOrb = document.querySelector('#musicOrb')
const musicPlayer = document.querySelector('#musicPlayer')
const closePlayer = document.querySelector('#closePlayer')
const playlist = document.querySelector('#playlist')
const trackTitle = document.querySelector('#trackTitle')
const trackArtist = document.querySelector('#trackArtist')
const trackProgress = document.querySelector('#trackProgress')
const currentTimeLabel = document.querySelector('#currentTime')
const durationTimeLabel = document.querySelector('#durationTime')
const playPause = document.querySelector('#playPause')
const prevTrack = document.querySelector('#prevTrack')
const nextTrack = document.querySelector('#nextTrack')
const rewindTen = document.querySelector('#rewindTen')
const forwardTen = document.querySelector('#forwardTen')
const mixButton = document.querySelector('#mixButton')
const volumeSlider = document.querySelector('#volumeSlider')
const volumeValue = document.querySelector('#volumeValue')
const nextUp = document.querySelector('#nextUp')



// -----------------------------------------------------------------------------
// Soundtrack
// -----------------------------------------------------------------------------
const tracks = [
  {
    title: 'Cuando Me Enamoro',
    artist: 'Enrique Iglesias',
    src: `${import.meta.env.BASE_URL}assets/audio/cuando-me-enamoro.mp3`,
    durationLabel: '3:20',
  },
  {
    title: 'Ojitos Lindos',
    artist: 'Bad Bunny ft. Bomba Estéreo',
    src: `${import.meta.env.BASE_URL}assets/audio/ojitos-lindos.mp3`,
    durationLabel: '4:19',
  },
  {
    title: 'Es Por Ti',
    artist: 'Juanes',
    src: `${import.meta.env.BASE_URL}assets/audio/es-por-ti.mp3`,
    durationLabel: '4:02',
  },
]

const audioA = new Audio()
const audioB = new Audio()
audioA.preload = 'metadata'
audioB.preload = 'metadata'

let activeAudio = audioA
let standbyAudio = audioB
let currentTrackIndex = -1
let masterVolume = 0.58
let mixMode = false
let crossfading = false
let mixTransitionQueued = false
let nextTimer = null
let nextUpTimer = null
let isSeeking = false

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

function paintRange(range, value, accent = 'rgba(232,173,200,.95)') {
  const min = Number(range.min || 0)
  const max = Number(range.max || 100)
  const pct = ((Number(value) - min) / (max - min)) * 100
  range.style.background = `linear-gradient(90deg, ${accent} 0%, ${accent} ${pct}%, rgba(255,255,255,.16) ${pct}%, rgba(255,255,255,.16) 100%)`
}

function updatePlaylistUI() {
  playlist.querySelectorAll('.playlist__track').forEach((button, index) => {
    button.classList.toggle('playlist__track--active', index === currentTrackIndex)
    button.setAttribute('aria-current', index === currentTrackIndex ? 'true' : 'false')
  })
}

function renderPlaylist() {
  playlist.innerHTML = tracks.map((track, index) => `
    <button class="playlist__track" type="button" data-track="${index}" aria-label="Escuchar ${track.title}">
      <span class="playlist__number">0${index + 1}</span>
      <span class="playlist__meta">
        <strong>${track.title}</strong>
        <span>${track.artist}</span>
      </span>
      <span class="playlist__duration">${track.durationLabel}</span>
    </button>
  `).join('')

  playlist.querySelectorAll('.playlist__track').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.track)
      playTrack(index, { transition: currentTrackIndex >= 0 && !activeAudio.paused })
    })
  })
}

function announceNext(index, prefix = 'Siguiente') {
  const track = tracks[index]
  clearTimeout(nextUpTimer)
  nextUp.innerHTML = `<span>${prefix}</span><strong>${track.title}</strong><small>${track.artist}</small>`
  nextUp.classList.add('next-up--visible')
  nextUpTimer = window.setTimeout(() => nextUp.classList.remove('next-up--visible'), 4200)
}

function setNowPlaying(index) {
  currentTrackIndex = index
  const track = tracks[index]
  trackTitle.textContent = track.title
  trackArtist.textContent = track.artist
  updatePlaylistUI()
}

function nextIndex({ random = mixMode } = {}) {
  if (currentTrackIndex < 0) return 0
  if (!random) return (currentTrackIndex + 1) % tracks.length
  const candidates = tracks.map((_, index) => index).filter((index) => index !== currentTrackIndex)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function previousIndex() {
  if (currentTrackIndex < 0) return 0
  return (currentTrackIndex - 1 + tracks.length) % tracks.length
}

function setPlayState(isPlaying) {
  playPause.textContent = isPlaying ? '❚❚' : '▶'
  playPause.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproducir')
  musicOrb.classList.toggle('music-orb--playing', isPlaying)
  musicPlayer.classList.toggle('music-player--playing', isPlaying)
}

async function loadInto(audio, index, startVolume = masterVolume) {
  audio.src = tracks[index].src
  audio.currentTime = 0
  audio.volume = Math.max(0, Math.min(1, startVolume))
  audio.load()
  return index
}

async function playTrack(index, { transition = false, duration = 1500 } = {}) {
  clearTimeout(nextTimer)
  mixTransitionQueued = false

  if (currentTrackIndex === index && activeAudio.src) {
    try {
      await activeAudio.play()
      setPlayState(true)
    } catch (error) {
      console.warn('El navegador bloqueó la reproducción automática.', error)
    }
    return
  }

  if (!transition || currentTrackIndex < 0 || activeAudio.paused) {
    activeAudio.pause()
    await loadInto(activeAudio, index, masterVolume)
    setNowPlaying(index)
    try {
      await activeAudio.play()
      setPlayState(true)
    } catch (error) {
      setPlayState(false)
    }
    return
  }

  crossfadeTo(index, duration)
}

async function crossfadeTo(index, duration = 2200) {
  if (crossfading) return
  crossfading = true
  mixTransitionQueued = true

  await loadInto(standbyAudio, index, 0)
  setNowPlaying(index)

  try {
    await standbyAudio.play()
  } catch (error) {
    crossfading = false
    mixTransitionQueued = false
    return
  }

  const from = activeAudio
  const to = standbyAudio
  const startedAt = performance.now()

  function step(now) {
    const t = Math.min((now - startedAt) / duration, 1)
    const smooth = t * t * (3 - 2 * t)
    from.volume = masterVolume * (1 - smooth)
    to.volume = masterVolume * smooth

    if (t < 1) {
      requestAnimationFrame(step)
      return
    }

    from.pause()
    from.currentTime = 0
    from.volume = masterVolume
    activeAudio = to
    standbyAudio = from
    activeAudio.volume = masterVolume
    crossfading = false
    mixTransitionQueued = false
    setPlayState(true)
  }

  requestAnimationFrame(step)
}

function scheduleNormalNext() {
  const index = nextIndex({ random: false })
  announceNext(index, 'Ahora sigue')
  clearTimeout(nextTimer)
  nextTimer = window.setTimeout(() => playTrack(index, { transition: false }), 1600)
}

function onAudioTimeUpdate(event) {
  if (event.currentTarget !== activeAudio || isSeeking) return
  const audio = activeAudio
  const duration = audio.duration
  const current = audio.currentTime

  if (Number.isFinite(duration) && duration > 0) {
    const value = Math.min(1000, Math.max(0, (current / duration) * 1000))
    trackProgress.value = value
    paintRange(trackProgress, value)
    currentTimeLabel.textContent = formatTime(current)
    durationTimeLabel.textContent = formatTime(duration)

    if (mixMode && !crossfading && !mixTransitionQueued && !audio.paused && duration - current <= 4.2 && duration - current > 0.3) {
      const index = nextIndex({ random: true })
      mixTransitionQueued = true
      announceNext(index, 'MIX enlaza con')
      crossfadeTo(index, 3400)
    }
  }
}

function onAudioPlay(event) {
  if (event.currentTarget === activeAudio) setPlayState(true)
}

function onAudioPause(event) {
  if (event.currentTarget === activeAudio && !crossfading) setPlayState(false)
}

function onAudioEnded(event) {
  if (event.currentTarget !== activeAudio || crossfading) return
  setPlayState(false)
  if (!mixMode) scheduleNormalNext()
}

function bindAudio(audio) {
  audio.addEventListener('timeupdate', onAudioTimeUpdate)
  audio.addEventListener('play', onAudioPlay)
  audio.addEventListener('pause', onAudioPause)
  audio.addEventListener('ended', onAudioEnded)
  audio.addEventListener('loadedmetadata', (event) => {
    if (event.currentTarget === activeAudio) {
      durationTimeLabel.textContent = formatTime(activeAudio.duration)
    }
  })
}

bindAudio(audioA)
bindAudio(audioB)
renderPlaylist()
paintRange(trackProgress, 0)
paintRange(volumeSlider, volumeSlider.value, 'rgba(255,224,139,.92)')

musicOrb.addEventListener('click', () => {
  const open = !musicPlayer.classList.contains('music-player--open')
  musicPlayer.classList.toggle('music-player--open', open)
  musicPlayer.setAttribute('aria-hidden', String(!open))
  if (open) {
    messagePanel.classList.remove('message-panel--open')
    messagePanel.setAttribute('aria-hidden', 'true')
  }
})

closePlayer.addEventListener('click', () => {
  musicPlayer.classList.remove('music-player--open')
  musicPlayer.setAttribute('aria-hidden', 'true')
})

playPause.addEventListener('click', async () => {
  if (currentTrackIndex < 0) {
    await playTrack(0)
    return
  }

  if (activeAudio.paused) {
    try {
      await activeAudio.play()
      setPlayState(true)
    } catch (error) {
      setPlayState(false)
    }
  } else {
    activeAudio.pause()
  }
})

nextTrack.addEventListener('click', () => {
  const index = nextIndex({ random: mixMode })
  announceNext(index, mixMode ? 'MIX salta a' : 'Siguiente')
  playTrack(index, { transition: !activeAudio.paused, duration: mixMode ? 1800 : 700 })
})

prevTrack.addEventListener('click', () => {
  if (currentTrackIndex >= 0 && activeAudio.currentTime > 7) {
    activeAudio.currentTime = 0
    return
  }
  const index = previousIndex()
  playTrack(index, { transition: !activeAudio.paused, duration: 700 })
})

rewindTen.addEventListener('click', () => {
  if (currentTrackIndex < 0) return
  activeAudio.currentTime = Math.max(0, activeAudio.currentTime - 10)
})

forwardTen.addEventListener('click', () => {
  if (currentTrackIndex < 0 || !Number.isFinite(activeAudio.duration)) return
  activeAudio.currentTime = Math.min(activeAudio.duration - 0.05, activeAudio.currentTime + 10)
})

mixButton.addEventListener('click', () => {
  mixMode = !mixMode
  mixButton.classList.toggle('mix-button--active', mixMode)
  mixButton.setAttribute('aria-pressed', String(mixMode))
  announceNext(nextIndex({ random: mixMode }), mixMode ? 'MIX activado · próxima' : 'Orden normal · próxima')
})

trackProgress.addEventListener('pointerdown', () => { isSeeking = true })
trackProgress.addEventListener('pointerup', () => { isSeeking = false })
trackProgress.addEventListener('input', () => {
  if (!Number.isFinite(activeAudio.duration) || activeAudio.duration <= 0) return
  const ratio = Number(trackProgress.value) / 1000
  activeAudio.currentTime = ratio * activeAudio.duration
  currentTimeLabel.textContent = formatTime(activeAudio.currentTime)
  paintRange(trackProgress, trackProgress.value)
})
trackProgress.addEventListener('change', () => { isSeeking = false })

volumeSlider.addEventListener('input', () => {
  masterVolume = Number(volumeSlider.value) / 100
  activeAudio.volume = masterVolume
  if (!crossfading) standbyAudio.volume = masterVolume
  volumeValue.textContent = `${volumeSlider.value}%`
  paintRange(volumeSlider, volumeSlider.value, 'rgba(255,224,139,.92)')
})


// -----------------------------------------------------------------------------
// Scene
// -----------------------------------------------------------------------------
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x020207)
scene.fog = new THREE.FogExp2(0x020207, 0.012)

const camera = new THREE.PerspectiveCamera(
  48,
  window.innerWidth / window.innerHeight,
  0.1,
  220,
)
camera.position.set(0, 14.5, 29)

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompactDevice ? 1.25 : 1.8))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.96
sceneHost.appendChild(renderer.domElement)

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.42,
  0.48,
  0.2,
)
composer.addPass(bloomPass)
composer.addPass(new OutputPass())

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.045
controls.enablePan = false
controls.enableZoom = true
controls.minDistance = 10
controls.maxDistance = 58
controls.minPolarAngle = 0.08
controls.maxPolarAngle = Math.PI - 0.08
controls.autoRotate = true
controls.autoRotateSpeed = 0.24
controls.target.set(0, 0, 0)
controls.rotateSpeed = 0.45
controls.zoomSpeed = 0.75
controls.enabled = false

// -----------------------------------------------------------------------------
// Procedural textures
// -----------------------------------------------------------------------------
function makeFlowerTexture({ petals = 7, hue = 330, saturation = 55, light = 75, centerHue = 42 }) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const cx = size / 2
  const cy = size / 2

  ctx.clearRect(0, 0, size, size)

  // Soft aura
  const aura = ctx.createRadialGradient(cx, cy, 2, cx, cy, size * 0.48)
  aura.addColorStop(0, `hsla(${hue}, ${saturation}%, ${Math.min(light + 6, 96)}%, .16)`)
  aura.addColorStop(0.38, `hsla(${hue}, ${saturation}%, ${light}%, .03)`)
  aura.addColorStop(1, `hsla(${hue}, ${saturation}%, ${light}%, 0)`)
  ctx.fillStyle = aura
  ctx.fillRect(0, 0, size, size)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.globalCompositeOperation = 'source-over'

  for (let i = 0; i < petals; i += 1) {
    ctx.save()
    ctx.rotate((Math.PI * 2 * i) / petals)

    const petalGradient = ctx.createRadialGradient(0, -25, 4, 0, -48, 62)
    petalGradient.addColorStop(0, `hsla(${hue + 8}, ${Math.min(saturation + 6, 100)}%, ${Math.min(light + 12, 98)}%, 1)`)
    petalGradient.addColorStop(0.55, `hsla(${hue}, ${Math.min(saturation + 14, 100)}%, ${Math.max(light - 2, 24)}%, .98)`)
    petalGradient.addColorStop(1, `hsla(${hue - 12}, ${Math.min(saturation + 10, 100)}%, ${Math.max(light - 28, 18)}%, .28)`)

    ctx.beginPath()
    ctx.moveTo(0, -8)
    ctx.bezierCurveTo(32, -20, 42, -72, 0, -91)
    ctx.bezierCurveTo(-42, -72, -32, -20, 0, -8)
    ctx.closePath()
    ctx.fillStyle = petalGradient
    ctx.fill()
    ctx.restore()
  }

  const center = ctx.createRadialGradient(0, 0, 1, 0, 0, 25)
  center.addColorStop(0, `hsla(${centerHue}, 100%, 92%, 1)`)
  center.addColorStop(0.35, `hsla(${centerHue}, 95%, 64%, .98)`)
  center.addColorStop(0.8, `hsla(${centerHue - 18}, 90%, 38%, .95)`)
  center.addColorStop(1, `hsla(${centerHue - 20}, 90%, 25%, .2)`)
  ctx.beginPath()
  ctx.arc(0, 0, 25, 0, Math.PI * 2)
  ctx.fillStyle = center
  ctx.fill()

  // Tiny pollen dots
  for (let i = 0; i < 18; i += 1) {
    const a = Math.random() * Math.PI * 2
    const r = 7 + Math.random() * 11
    ctx.beginPath()
    ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.2 + Math.random() * 1.8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 244, 178, .8)'
    ctx.fill()
  }

  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  return texture
}

function makeGlowTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.12, 'rgba(255,245,220,.94)')
  gradient.addColorStop(0.33, 'rgba(223,183,255,.35)')
  gradient.addColorStop(1, 'rgba(120,90,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const flowerPresets = [
  { petals: 6, hue: 338, saturation: 58, light: 79, centerHue: 42 },
  { petals: 7, hue: 282, saturation: 52, light: 77, centerHue: 48 },
  { petals: 8, hue: 214, saturation: 46, light: 82, centerHue: 48 },
  { petals: 5, hue: 16, saturation: 64, light: 80, centerHue: 45 },
  { petals: 9, hue: 48, saturation: 42, light: 88, centerHue: 38 },
  { petals: 6, hue: 305, saturation: 45, light: 87, centerHue: 52 },
]

const flowerTextures = flowerPresets.map(makeFlowerTexture)
const glowTexture = makeGlowTexture()

// -----------------------------------------------------------------------------
// Galaxy construction
// -----------------------------------------------------------------------------
const galaxy = new THREE.Group()
scene.add(galaxy)
galaxy.rotation.x = THREE.MathUtils.degToRad(-10)
galaxy.rotation.z = THREE.MathUtils.degToRad(4)

const galaxyConfig = {
  radius: 21,
  branches: 5,
  flowerCount: isCompactDevice ? 4200 : 7200,
  dustCount: isCompactDevice ? 4600 : 7600,
  spin: 1.7,
  randomness: 0.54,
  thickness: 0.42,
}

function randomNormalish() {
  return (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2
}

const flowerBuckets = flowerTextures.map(() => [])

for (let i = 0; i < galaxyConfig.flowerCount; i += 1) {
  // More flowers toward the center, but keep a long visible arm distribution.
  const r = Math.pow(Math.random(), 0.64) * galaxyConfig.radius + 0.45
  const branch = i % galaxyConfig.branches
  const branchAngle = (branch / galaxyConfig.branches) * Math.PI * 2
  const spiralAngle = r * galaxyConfig.spin * 0.21
  const angularScatter = randomNormalish() * (0.17 + r * 0.008)
  const angle = branchAngle + spiralAngle + angularScatter

  const spread = Math.pow(r / galaxyConfig.radius, 0.72)
  const radialScatter = randomNormalish() * galaxyConfig.randomness * (1.2 + r * 0.12)
  const x = Math.cos(angle) * r + Math.cos(angle + Math.PI / 2) * radialScatter
  const z = Math.sin(angle) * r + Math.sin(angle + Math.PI / 2) * radialScatter
  const y = randomNormalish() * galaxyConfig.thickness * (1.35 - spread * 0.6)

  const presetIndex = Math.floor(Math.random() * flowerTextures.length)
  flowerBuckets[presetIndex].push(x, y, z)
}

flowerBuckets.forEach((positions, index) => {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))

  const material = new THREE.PointsMaterial({
    map: flowerTextures[index],
    transparent: true,
    alphaTest: 0.1,
    depthWrite: false,
    blending: THREE.NormalBlending,
    size: index === 4 ? 0.9 : 0.78 + index * 0.03,
    sizeAttenuation: true,
    opacity: 1,
    toneMapped: true,
  })

  const flowers = new THREE.Points(geometry, material)
  flowers.renderOrder = 2
  galaxy.add(flowers)
})

// Starlike pollen between the flowers.
const dustPositions = []
const dustColors = []
const innerColor = new THREE.Color('#fff1cf')
const middleColor = new THREE.Color('#d7c7ff')
const outerColor = new THREE.Color('#8aa7ff')

for (let i = 0; i < galaxyConfig.dustCount; i += 1) {
  const r = Math.pow(Math.random(), 0.55) * galaxyConfig.radius
  const branch = i % galaxyConfig.branches
  const branchAngle = (branch / galaxyConfig.branches) * Math.PI * 2
  const spiralAngle = r * galaxyConfig.spin * 0.21
  const noise = randomNormalish() * (0.6 + r * 0.07)
  const angle = branchAngle + spiralAngle + randomNormalish() * 0.26
  dustPositions.push(
    Math.cos(angle) * r + Math.cos(angle + Math.PI / 2) * noise,
    randomNormalish() * 0.75,
    Math.sin(angle) * r + Math.sin(angle + Math.PI / 2) * noise,
  )

  const t = r / galaxyConfig.radius
  const color = t < 0.38
    ? innerColor.clone().lerp(middleColor, t / 0.38)
    : middleColor.clone().lerp(outerColor, (t - 0.38) / 0.62)
  dustColors.push(color.r, color.g, color.b)
}

const dustGeometry = new THREE.BufferGeometry()
dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3))
dustGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dustColors, 3))

const dustMaterial = new THREE.PointsMaterial({
  map: glowTexture,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  size: 0.1,
  sizeAttenuation: true,
  opacity: 0.34,
})

galaxy.add(new THREE.Points(dustGeometry, dustMaterial))

// Dense luminous nucleus.
const nucleusPositions = []
for (let i = 0; i < 1900; i += 1) {
  const theta = Math.random() * Math.PI * 2
  const radius = Math.pow(Math.random(), 2.25) * 4.4
  const flatten = randomNormalish() * 0.55 * (1 - radius / 5.5)
  nucleusPositions.push(Math.cos(theta) * radius, flatten, Math.sin(theta) * radius)
}

const nucleusGeometry = new THREE.BufferGeometry()
nucleusGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nucleusPositions, 3))
const nucleusMaterial = new THREE.PointsMaterial({
  map: glowTexture,
  color: new THREE.Color('#fff1d3'),
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  size: 0.32,
  sizeAttenuation: true,
  opacity: 0.62,
})
galaxy.add(new THREE.Points(nucleusGeometry, nucleusMaterial))

const nucleusLightMaterial = new THREE.SpriteMaterial({
  map: glowTexture,
  color: '#fff5dc',
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  opacity: 0.42,
})
const nucleusGlow = new THREE.Sprite(nucleusLightMaterial)
nucleusGlow.scale.set(6.8, 6.8, 1)
nucleusGlow.position.set(0, 0.05, 0)
galaxy.add(nucleusGlow)

// -----------------------------------------------------------------------------
// Deep space background
// -----------------------------------------------------------------------------
const starPositions = []
const starColors = []
const starCount = isCompactDevice ? 3200 : 5200

for (let i = 0; i < starCount; i += 1) {
  const radius = 72 + Math.random() * 95
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  const x = radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  starPositions.push(x, y, z)

  const roll = Math.random()
  const color = roll > 0.93
    ? new THREE.Color('#ffd9b8')
    : roll > 0.8
      ? new THREE.Color('#b9c8ff')
      : new THREE.Color('#eef1ff')
  const intensity = 0.48 + Math.random() * 0.52
  starColors.push(color.r * intensity, color.g * intensity, color.b * intensity)
}

const starsGeometry = new THREE.BufferGeometry()
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3))
starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3))
const starsMaterial = new THREE.PointsMaterial({
  map: glowTexture,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  size: 0.24,
  sizeAttenuation: true,
  opacity: 0.62,
})
const starField = new THREE.Points(starsGeometry, starsMaterial)
scene.add(starField)

// Soft colored nebulas using large sprites.
const nebulaGroup = new THREE.Group()
const nebulaPalette = ['#4c3186', '#1a3e78', '#7f315f', '#173a50']
for (let i = 0; i < 10; i += 1) {
  const material = new THREE.SpriteMaterial({
    map: glowTexture,
    color: nebulaPalette[i % nebulaPalette.length],
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.03 + Math.random() * 0.02,
    depthWrite: false,
  })
  const sprite = new THREE.Sprite(material)
  const angle = Math.random() * Math.PI * 2
  const distance = 26 + Math.random() * 50
  sprite.position.set(
    Math.cos(angle) * distance,
    (Math.random() - 0.5) * 28,
    Math.sin(angle) * distance,
  )
  const scale = 18 + Math.random() * 26
  sprite.scale.set(scale, scale, 1)
  nebulaGroup.add(sprite)
}
scene.add(nebulaGroup)

// -----------------------------------------------------------------------------
// Interaction / UI
// -----------------------------------------------------------------------------
let entered = false
let introStart = performance.now()
let userHasMoved = false
let interactionTimer

function enterExperience() {
  if (entered) return
  entered = true
  intro.classList.add('intro--hidden')
  hudTop.classList.add('hud--visible')
  hudBottom.classList.add('hud--visible')
  controls.enabled = true
  controls.autoRotate = true
  musicShell.setAttribute('aria-hidden', 'false')
  musicShell.classList.add('music-shell--visible')
  window.setTimeout(() => {
    musicPlayer.classList.add('music-player--open')
    musicPlayer.setAttribute('aria-hidden', 'false')
  }, 650)

  camera.position.set(0, 12.8, 27)
  controls.update()

  window.setTimeout(() => {
    intro.setAttribute('aria-hidden', 'true')
  }, 1000)
}

enterButton.addEventListener('click', enterExperience)

infoButton.addEventListener('click', () => {
  const isOpen = messagePanel.classList.toggle('message-panel--open')
  messagePanel.setAttribute('aria-hidden', String(!isOpen))
  if (isOpen) {
    musicPlayer.classList.remove('music-player--open')
    musicPlayer.setAttribute('aria-hidden', 'true')
  }
})

closeMessage.addEventListener('click', () => {
  messagePanel.classList.remove('message-panel--open')
  messagePanel.setAttribute('aria-hidden', 'true')
})

controls.addEventListener('start', () => {
  userHasMoved = true
  controls.autoRotate = false
  clearTimeout(interactionTimer)
})

controls.addEventListener('end', () => {
  clearTimeout(interactionTimer)
  interactionTimer = window.setTimeout(() => {
    controls.autoRotate = true
  }, 1350)
})

// -----------------------------------------------------------------------------
// Animation
// -----------------------------------------------------------------------------
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()

  // Independent, almost imperceptible galactic rotation. The whole scene never stops living.
  galaxy.rotation.y += entered ? 0.00034 : 0.00014
  galaxy.position.y = Math.sin(elapsed * 0.22) * 0.12

  starField.rotation.y = elapsed * 0.003
  starField.rotation.x = Math.sin(elapsed * 0.035) * 0.012
  nebulaGroup.rotation.y = -elapsed * 0.0014

  nucleusLightMaterial.opacity = 0.34 + Math.sin(elapsed * 0.8) * 0.05

  // Cinematic camera drift before the user enters.
  if (!entered) {
    const introElapsed = (performance.now() - introStart) * 0.0001
    camera.position.x = Math.sin(introElapsed) * 1.7
    camera.position.y = 14.8 + Math.sin(introElapsed * 0.62) * 0.3
    camera.lookAt(0, 0, 0)
  } else {
    controls.update()
  }

  composer.render()
}

animate()

// Remove loading screen only after the first frames are ready.
window.setTimeout(() => {
  loading.classList.add('loading--hidden')
}, 650)

// -----------------------------------------------------------------------------
// Responsive renderer
// -----------------------------------------------------------------------------
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompactDevice ? 1.25 : 1.8))
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)

  if (window.innerWidth < 720 && !userHasMoved) {
    camera.position.set(0, 13.5, 34)
  }
}

window.addEventListener('resize', handleResize)
handleResize()
