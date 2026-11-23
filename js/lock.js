// Écran de code (8 chiffres) à l'ouverture. Simple dissuasion : le site reste statique et public,
// ce n'est pas une vraie protection. Seule l'empreinte SHA-256 du code est stockée ici.
(function () {
  const HASH = 'c837220d6957b947363b64b652aae8bddac53687d9c0142f77ddf2fc1e3a005d';
  const KEY = 'griffonsUnlock';
  const root = document.documentElement;
  let ok = false;
  try { ok = localStorage.getItem(KEY) === HASH; } catch (e) {}
  if (ok) return;
  root.classList.add('locked');

  const sha = async (t) => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('lock');
    const input = document.getElementById('lockCode');
    const msg = document.getElementById('lockMsg');
    box.hidden = false;
    input.focus();
    input.addEventListener('input', async () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 8);
      msg.textContent = '';
      if (input.value.length < 8) return;
      if ((await sha(input.value)) === HASH) {
        try { localStorage.setItem(KEY, HASH); } catch (e) {}
        root.classList.remove('locked');
        box.remove();
      } else {
        msg.textContent = 'Code incorrect';
        input.value = '';
        box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
      }
    });
  });
})();
