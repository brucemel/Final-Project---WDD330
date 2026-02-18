/**
 * music.js
 * Module for background music playback using Deezer API 30-second previews.
 * Handles: fetching tracks, playing/pausing, skipping, volume, and
 * persisting the current track across page navigation via localStorage.
 */

let audio      = null;   // The current HTML Audio element
let tracks     = [];     // Array of track objects fetched from Deezer
let trackIndex = 0;      // Index of the currently playing track
let isPlaying  = false;  // Whether audio is currently playing
let onPlayStateChange = null; // Callback to notify the UI when play state changes

/**
 * Registers a callback function that will be called every time
 * the play state changes (playing or paused).
 * Used by main.js and favorites.js to keep the play button in sync.
 */
export function onPlayChange(cb) {
  onPlayStateChange = cb;
}

/**
 * Fetches the list of music tracks from the server.
 * The server queries the Deezer API and returns tracks with:
 * { id, title, artist, preview (URL), cover }
 * Stores the tracks in the local 'tracks' array and returns it.
 * Returns an empty array if the request fails.
 */
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

/**
 * Plays the track at the given index from the tracks array.
 * - Stops any currently playing audio before switching tracks.
 * - Saves the track index to localStorage so it persists across page navigation.
 * - Tries to autoplay immediately. If the browser blocks autoplay,
 *   it waits for the first user click or keypress to start playing.
 * - When a track ends, automatically plays the next one.
 * Returns the track object, or null if no tracks are loaded.
 */
export async function playTrack(index) {
  if (!tracks.length) return null;

  // Wrap around if index goes out of bounds
  trackIndex = index % tracks.length;
  const track = tracks[trackIndex];

  // Remember which track was last playing (survives page reload)
  localStorage.setItem('dib_track_index', trackIndex);

  // Stop and release the previous audio before creating a new one
  if (audio) {
    audio.pause();
    audio.src = '';
  }

  // Create a new Audio element with the Deezer preview URL
  audio = new Audio(track.preview);
  audio.volume = getVolume();

  // When the current track finishes, play the next one automatically
  audio.addEventListener('ended', () => playTrack(trackIndex + 1));

  try {
    // Attempt immediate autoplay
    await audio.play();
    isPlaying = true;
    onPlayStateChange?.(true);
  } catch {
    // Browser blocked autoplay — wait for first user interaction
    isPlaying = false;
    onPlayStateChange?.(false);

    const startOnInteraction = async () => {
      try {
        await audio.play();
        isPlaying = true;
        onPlayStateChange?.(true);
      } catch {}
      // Remove listeners after the first successful interaction
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
    };

    document.addEventListener('click', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
  }

  return track;
}

/**
 * Plays the next track in the list.
 * Wraps around to the first track after the last one.
 */
export async function playNext() {
  return playTrack(trackIndex + 1);
}

/**
 * Plays the previous track in the list.
 * Wraps around to the last track if already at the beginning.
 */
export async function playPrev() {
  return playTrack(trackIndex - 1 < 0 ? tracks.length - 1 : trackIndex - 1);
}

/**
 * Toggles the audio between playing and paused.
 * Updates the isPlaying state and notifies the UI via onPlayStateChange.
 * Returns true if now playing, false if now paused.
 */
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

/**
 * Sets the audio volume to the given value (0.0 to 1.0).
 * Also saves the volume to localStorage so it persists between sessions.
 */
export function setVolume(value) {
  if (audio) audio.volume = value;
  localStorage.setItem('dib_volume', value);
}

/**
 * Returns the saved volume level from localStorage.
 * Defaults to 0.4 (40%) if no value has been saved yet.
 */
export function getVolume() {
  return parseFloat(localStorage.getItem('dib_volume') ?? 0.4);
}

/**
 * Returns the track index saved in localStorage.
 * Used to resume the same song when navigating between pages.
 * Defaults to 0 (first track) if nothing is saved.
 */
export function getSavedTrackIndex() {
  return parseInt(localStorage.getItem('dib_track_index') ?? '0', 10);
}

/**
 * Returns whether audio is currently playing.
 */
export function getIsPlaying() {
  return isPlaying;
}
