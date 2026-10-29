/* A short "tuning the radio" sound when the visitor presses play:
 * a whisper of static that sweeps across the dial and settles. Made with the
 * Web Audio API, so there's no sound file to download. It only ever plays
 * right after a click on a play button, and the speaker switch in the top
 * bar turns it off (remembered on this device). */

const KEY = "votd-radio-sound";
let ctx = null;

export function radioSoundOn() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setRadioSound(on) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
}

export function tuneIn() {
  if (!radioSoundOn()) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const dur = 0.9;

    // static: white noise through a band-pass filter that sweeps the dial
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.4;
    band.frequency.setValueAtTime(600, now);
    band.frequency.exponentialRampToValueAtTime(2600, now + 0.35);
    band.frequency.exponentialRampToValueAtTime(1200, now + dur);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.09, now + 0.06);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    // the station "catching": a soft warble that fades in under the static
    const tone = ctx.createOscillator();
    tone.type = "sine";
    tone.frequency.setValueAtTime(520, now + 0.3);
    tone.frequency.exponentialRampToValueAtTime(440, now + 0.6);
    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.0001, now);
    toneGain.gain.exponentialRampToValueAtTime(0.025, now + 0.55);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.connect(band).connect(noiseGain).connect(ctx.destination);
    tone.connect(toneGain).connect(ctx.destination);
    noise.start(now);
    tone.start(now + 0.3);
    noise.stop(now + dur);
    tone.stop(now + dur);
  } catch {}
}
