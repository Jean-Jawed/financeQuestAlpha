"""
FINANCEQUEST - SONS DU JEU
Synthèse des sons (numpy + scipy), encodage MP3 mono 96 kbit/s (ffmpeg) dans public/sons/.
Direction : la corbeille vers 1900. Cloche en laiton, tampon encreur, caisse
enregistreuse, volets de tableau d'affichage. Pas de bip numérique.

    python scripts/generate-sounds.py

Les sons sont déterministes (graine fixe) : relancer le script redonne les mêmes fichiers.
"""

import os
import subprocess
import tempfile
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'sons')
rng = np.random.default_rng(1900)


# ==========================================
# OUTILS
# ==========================================

def t_axis(duration):
    return np.arange(int(SR * duration)) / SR


def silence(duration):
    return np.zeros(int(SR * duration))


def noise(duration):
    return rng.standard_normal(int(SR * duration))


def band(signal, low=None, high=None, order=4):
    """Filtre passe-bas, passe-haut ou passe-bande (Butterworth)"""
    if low and high:
        sos = butter(order, [low, high], btype='bandpass', fs=SR, output='sos')
    elif high:
        sos = butter(order, high, btype='lowpass', fs=SR, output='sos')
    else:
        sos = butter(order, low, btype='highpass', fs=SR, output='sos')
    return sosfilt(sos, signal)


def env(duration, attack=0.002, decay=0.2):
    """Attaque linéaire très courte, puis décroissance exponentielle"""
    t = t_axis(duration)
    attack_part = np.clip(t / attack, 0, 1)
    return attack_part * np.exp(-np.maximum(t - attack, 0) / decay)


def place(track, sound, at):
    """Poser un son dans une piste à l'instant `at` (secondes)"""
    start = int(SR * at)
    end = min(len(track), start + len(sound))
    track[start:end] += sound[: end - start]
    return track


def fade_out(signal, duration=0.05):
    n = min(len(signal), int(SR * duration))
    signal[-n:] *= np.linspace(1, 0, n)
    return signal


def normalize(signal, peak_db=-1.0):
    peak = np.max(np.abs(signal)) or 1
    return signal / peak * (10 ** (peak_db / 20))


# ==========================================
# TIMBRES
# ==========================================

# Partiels d'une cloche (rapports à la note nominale) : bourdon, fondamentale,
# tierce mineure, quinte, nominale, et partiels aigus inharmoniques
BELL_PARTIALS = [
    (0.50, 0.35, 1.9),
    (1.00, 1.00, 1.4),
    (1.19, 0.55, 1.0),
    (1.50, 0.40, 0.8),
    (2.00, 0.70, 0.7),
    (2.51, 0.30, 0.45),
    (2.66, 0.25, 0.4),
    (3.01, 0.20, 0.3),
    (4.10, 0.12, 0.18),
]


def bell_strike(f0, duration=2.0, brightness=1.0):
    t = t_axis(duration)
    tone = np.zeros_like(t)
    for ratio, amp, decay in BELL_PARTIALS:
        # Léger désaccord entre partiels jumeaux : battements du métal
        detune = 1 + rng.uniform(-0.0015, 0.0015)
        partial = np.sin(2 * np.pi * f0 * ratio * detune * t + rng.uniform(0, 2 * np.pi))
        partial += 0.3 * np.sin(2 * np.pi * f0 * ratio * (detune + 0.0009) * t)
        tone += amp * (brightness if ratio > 2 else 1) * partial * env(duration, 0.001, decay)
    # Choc du battant : bruit bref et clair
    clank = band(noise(0.03), 1500, 9000) * env(0.03, 0.0005, 0.006)
    return place(tone, clank * 0.6, 0)


def click(freq=2600, decay=0.004, level=1.0):
    """Palette de bois et métal : bruit très bref et petite résonance"""
    d = 0.03
    body = np.sin(2 * np.pi * freq * t_axis(d)) * env(d, 0.0003, decay)
    tick = band(noise(d), 1200, 8000) * env(d, 0.0002, 0.0018)
    return level * (0.7 * tick + 0.5 * body)


# ==========================================
# SONS
# ==========================================

def cloche():
    """Clôture de la séance : deux coups de cloche en laiton"""
    track = silence(2.3)
    place(track, bell_strike(660, 2.2), 0.0)
    place(track, bell_strike(660, 1.7) * 0.75, 0.42)
    return fade_out(track, 0.3)


def ouverture():
    """Nouvelle partie : un coup de cloche clair, plus court"""
    return fade_out(bell_strike(990, 1.3, brightness=1.2), 0.25)


def volets():
    """Volets du tableau d'affichage qui basculent, en ralentissant"""
    track = silence(0.6)
    at, gap = 0.0, 0.022
    while at < 0.5:
        place(track, click(rng.uniform(2200, 3200), level=rng.uniform(0.6, 1.0)), at)
        at += gap * rng.uniform(0.8, 1.25)
        gap *= 1.09
    return fade_out(track, 0.05)


def tampon():
    """Tampon encreur : choc sourd, claque du papier, résonance du bureau"""
    d = 0.4
    t = t_axis(d)
    # Choc grave : la fréquence chute pendant l'impact
    sweep = 2 * np.pi * np.cumsum(55 + 85 * np.exp(-t / 0.02)) / SR
    thump = np.sin(sweep) * env(d, 0.001, 0.07)
    slap = band(noise(d), 300, 2400) * env(d, 0.0005, 0.018)
    knock = np.sin(2 * np.pi * 310 * t) * env(d, 0.001, 0.035)
    return fade_out(1.0 * thump + 0.55 * slap + 0.25 * knock, 0.05)


def caisse():
    """Caisse enregistreuse : cliquetis du mécanisme, tintement, monnaie"""
    track = silence(0.95)
    place(track, click(1800, 0.006, 0.9), 0.0)
    place(track, click(1500, 0.006, 0.8), 0.07)
    # Tiroir qui s'ouvre : petit grondement
    drawer = band(noise(0.12), 150, 900) * env(0.12, 0.01, 0.05)
    place(track, drawer * 0.5, 0.11)
    # Clochette de la caisse
    ding = bell_strike(2093, 0.8, brightness=0.8) * 0.55
    place(track, ding, 0.13)
    # Quelques pièces
    for at in rng.uniform(0.2, 0.5, 5):
        f = rng.uniform(3800, 6400)
        coin = np.sin(2 * np.pi * f * t_axis(0.12)) * env(0.12, 0.0005, 0.03)
        place(track, coin * rng.uniform(0.08, 0.16), at)
    return fade_out(track, 0.15)


def medaille():
    """Succès débloqué : arpège ascendant clair (do, mi, sol, do)"""
    track = silence(1.5)
    for index, freq in enumerate([523.25, 659.25, 783.99, 1046.5]):
        d = 1.2
        t = t_axis(d)
        tone = (
            np.sin(2 * np.pi * freq * t)
            + 0.35 * np.sin(2 * np.pi * freq * 2 * t)
            + 0.12 * np.sin(2 * np.pi * freq * 2.76 * t)
        ) * env(d, 0.003, 0.35 if index < 3 else 0.6)
        place(track, tone * (0.7 if index < 3 else 0.9), index * 0.085)
    shimmer = band(noise(1.0), 6000, 12000) * env(1.0, 0.2, 0.25) * 0.015
    place(track, shimmer, 0.25)
    return fade_out(track, 0.2)


def ticket():
    """Ticket d'ordre détaché du carnet : froissement de papier très court"""
    d = 0.18
    paper = band(noise(d), 1800, 7000)
    t = t_axis(d)
    bumps = env(d, 0.004, 0.03) + 0.6 * np.roll(env(d, 0.004, 0.025), int(SR * 0.05))
    return fade_out(paper * bumps, 0.03)


def refus():
    """Ordre refusé : double choc grave et étouffé"""
    track = silence(0.36)
    for at, level in [(0.0, 1.0), (0.12, 0.8)]:
        d = 0.18
        t = t_axis(d)
        thud = np.sin(2 * np.pi * (95 - 30 * t / d) * t) * env(d, 0.002, 0.04)
        muffle = band(noise(d), 80, 500) * env(d, 0.001, 0.02)
        # Fondu de sortie : pas de clic à la coupure du choc
        place(track, fade_out(level * (thud + 0.4 * muffle), 0.06), at)
    return fade_out(track, 0.05)


# Nom du fichier, fonction, niveau relatif (les sons fréquents restent discrets)
SOUNDS = [
    ('cloche', cloche, -2.0),
    ('ouverture', ouverture, -3.0),
    ('volets', volets, -6.0),
    ('tampon', tampon, -1.5),
    ('caisse', caisse, -3.0),
    ('medaille', medaille, -3.0),
    ('ticket', ticket, -9.0),
    ('refus', refus, -4.0),
]


def write_mp3(name, signal):
    pcm = (np.clip(signal, -1, 1) * 32767).astype(np.int16)
    with tempfile.TemporaryDirectory() as tmp:
        wav_path = os.path.join(tmp, f'{name}.wav')
        with wave.open(wav_path, 'wb') as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(SR)
            wav.writeframes(pcm.tobytes())
        out_path = os.path.join(OUT, f'{name}.mp3')
        subprocess.run(
            ['ffmpeg', '-y', '-loglevel', 'error', '-i', wav_path, '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '96k', out_path],
            check=True,
        )
    return out_path


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for name, build, level_db in SOUNDS:
        signal = normalize(build(), level_db)
        path = write_mp3(name, signal)
        size = os.path.getsize(path)
        total += size
        print(f'{name:<10} {len(signal) / SR:4.2f} s  {size / 1024:5.1f} Ko')
    print(f'total       {total / 1024:.1f} Ko')


if __name__ == '__main__':
    main()
