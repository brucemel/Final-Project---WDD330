let audio      = null;
let tracks     = [];
let trackIndex = 0;
let isPlaying  = false;
let onPlayStateChange = null;

// onPlayChange
export function onPlayChange(cb) {
  onPlayStateChange = cb;
}

// fetchTracks
export async function fetchTracks() {
  try {
    const response = await fetch('/api/music');
    if (!response.ok) throw new Error('Music fetch failed');
    const data = await response.json();
    tracks = data.tracks || [];
    return tracks;
  } catch (error) {
    console.error('Error fetching music:', error);
    return [];
  }
}

// playTrack
export async function playTrack(index) {
  if (!tracks.length) return null;

  trackIndex = index % tracks.length;
  const track = tracks[trackIndex];

  localStorage.setItem('dib_track_index', trackIndex);

  if (audio) {
    audio.pause();
    audio.src = '';
  }

  audio = new Audio(track.preview);
  audio.volume = getVolume();
  audio.addEventListener('ended', () => playTrack(trackIndex + 1));

  try {
    await audio.play();
    isPlaying = true;
    onPlayStateChange?.(true);
  } catch {
    isPlaying = false;
    onPlayStateChange?.(false);

    const startOnInteraction = async () => {
      try {
        await audio.play();
        isPlaying = true;
        onPlayStateChange?.(true);
      } catch {}
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
    };

    document.addEventListener('click', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
  }

  return track;
}

// playNext
export async function playNext() {
  return playTrack(trackIndex + 1);
}

// playPrev
export async function playPrev() {
  return playTrack(trackIndex - 1 < 0 ? tracks.length - 1 : trackIndex - 1);
}

// togglePlay
export function togglePlay() {
  if (!audio) return false;
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play().catch(() => {});
    isPlaying = true;
  }
  onPlayStateChange?.(isPlaying);
  return isPlaying;
}

// setVolume
export function setVolume(value) {
  if (audio) audio.volume = value;
  localStorage.setItem('dib_volume', value);
}

// getVolume
export function getVolume() {
  return parseFloat(localStorage.getItem('dib_volume') ?? 0.4);
}

// getSavedTrackIndex
export function getSavedTrackIndex() {
  return parseInt(localStorage.getItem('dib_track_index') ?? '0', 10);
}

// getIsPlaying
export function getIsPlaying() {
  return isPlaying;
}
