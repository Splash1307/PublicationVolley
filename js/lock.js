// Écran de code à l'ouverture. Simple dissuasion : le site reste statique et public,
// ce n'est pas une vraie protection. Seule l'empreinte SHA-256 du code est stockée ici.
(function () {
  const HASH = '8c144858bb5ea1a931069f55943c55a427e2530405bbe720e97aae0fda85ee8c';
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
      input.value = input.value.replace(/\D/g, '').slice(0, 4);
      msg.textContent = '';
      if (input.value.length < 4) return;
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
