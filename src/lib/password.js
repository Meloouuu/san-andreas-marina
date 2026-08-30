/* Hachage des mots de passe.

   Les mots de passe etaient stockes en clair dans la table `users` : n'importe
   qui pouvait les lire dans l'onglet reseau du navigateur. Ils sont desormais
   derives avec PBKDF2-SHA256 (sel aleatoire, 210 000 iterations), ce qui rend
   le mot de passe d'origine irrecuperable a partir de la base.

   Format stocke, en une seule colonne texte :
       pbkdf2$sha256$210000$<sel base64>$<empreinte base64>

   Migration : `verifyPassword()` accepte encore un mot de passe en clair
   (ancien format). Les comptes sont convertis automatiquement a leur
   prochaine connexion, et `scripts/hash-passwords.mjs` permet de tout
   convertir d'un coup.

   Limite assumee : la verification se fait dans le navigateur, il faut donc
   lui transmettre l'empreinte du compte concerne. Le hachage protege le mot
   de passe lui-meme (souvent reutilise ailleurs), pas l'acces a la base :
   seules des politiques RLS cote Supabase peuvent le faire. */

const ALGO = 'pbkdf2';
const HASH = 'sha256';
const ITERATIONS = 210000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

function toBase64(bytes) {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function fromBase64(text) {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    KEY_BITS,
  );
  return new Uint8Array(bits);
}

/* Vrai si la valeur stockee est deja une empreinte (et non un mot de passe
   en clair herite de l'ancienne version). */
export function isHashed(stored) {
  return typeof stored === 'string' && stored.startsWith(`${ALGO}$${HASH}$`);
}

/* Transforme un mot de passe en empreinte a stocker en base. */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const derived = await derive(password, salt, ITERATIONS);
  return [ALGO, HASH, ITERATIONS, toBase64(salt), toBase64(derived)].join('$');
}

/* Compare un mot de passe saisi a la valeur stockee.
   Accepte l'ancien format en clair pour ne bloquer personne pendant la
   migration. */
export async function verifyPassword(password, stored) {
  if (!password || !stored) return false;

  if (!isHashed(stored)) return password === stored;

  const [, , iterations, salt, expected] = stored.split('$');
  let derived;
  try {
    derived = await derive(password, fromBase64(salt), Number(iterations));
  } catch (error) {
    console.error('❌ Empreinte de mot de passe illisible :', error);
    return false;
  }

  const reference = fromBase64(expected);
  if (derived.length !== reference.length) return false;

  /* Comparaison a temps constant : on parcourt toujours tout le tableau. */
  let diff = 0;
  for (let i = 0; i < derived.length; i += 1) diff |= derived[i] ^ reference[i];
  return diff === 0;
}
