/* AlaricCode — Firebase Firestore + Authentication, adaptateur pour l'interface existante.
 * Nécessite firebase-app-compat, firebase-auth-compat et firebase-firestore-compat.
 */
(function (global) {
  'use strict';

  if (!global.firebase || !global.firebase.auth || !global.firebase.firestore) {
    throw new Error('Les bibliothèques Firebase ne sont pas chargées.');
  }

  const config = Object.freeze({
    apiKey: 'AIzaSyCAs_8GEdh9xSpR0tjMxtwwVBK-mTy-cMY',
    authDomain: 'alaricstock-c51d1.firebaseapp.com',
    projectId: 'alaricstock-c51d1',
    storageBucket: 'alaricstock-c51d1.firebasestorage.app',
    messagingSenderId: '393320398937',
    appId: '1:393320398937:web:5d8cd61d4637c7cedc7148',
    measurementId: 'G-96TNJTXQEP'
  });

  const app = global.firebase.apps.length
    ? global.firebase.app()
    : global.firebase.initializeApp(config);
  const firestore = global.firebase.firestore(app);
  const auth = global.firebase.auth(app);
  const stocks = firestore.collection('stocks');

  // Attend la restauration d'une éventuelle session Firebase (rechargement de page).
  const authReady = new Promise((resolve, reject) => {
    auth.onAuthStateChanged(() => resolve(), reject);
  });

  function result(task) {
    return Promise.resolve().then(task).then(
      data => ({ data, error: null }),
      error => ({ data: null, error })
    );
  }

  function documentFor(id) {
    // encodeURIComponent empêche qu'un ID de catalogue contenant '/' casse le chemin.
    return stocks.doc(encodeURIComponent(String(id)));
  }

  function quantity(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
      throw new Error('Le stock doit être un entier positif ou zéro.');
    }
    return n;
  }

  async function batchWrite(entries, mode) {
    // Les lots de 400 laissent une marge confortable sur la taille des écritures.
    for (let start = 0; start < entries.length; start += 400) {
      const chunk = entries.slice(start, start + 400);
      const batch = firestore.batch();
      for (const entry of chunk) {
        if (mode === 'delete') {
          batch.delete(documentFor(entry));
        } else {
          if (!entry || entry.item_id === undefined || entry.item_id === null) {
            throw new Error('item_id manquant dans une mise à jour de stock.');
          }
          const itemId = String(entry.item_id);
          batch.set(documentFor(itemId), { item_id: itemId, stock: quantity(entry.stock) });
        }
      }
      await batch.commit();
    }
  }

  const client = {
    from(table) {
      if (table !== 'stocks') throw new Error(`Collection inconnue : ${table}`);
      return {
        select() {
          return result(async () => {
            const snapshot = await stocks.get();
            return snapshot.docs.map(doc => {
              const entry = doc.data();
              return { item_id: String(entry.item_id || decodeURIComponent(doc.id)), stock: entry.stock };
            });
          });
        },
        upsert(entries) {
          return result(async () => {
            const rows = Array.isArray(entries) ? entries : [entries];
            await batchWrite(rows, 'set');
            return rows;
          });
        },
        delete() {
          return {
            eq(field, id) {
              if (field !== 'item_id') throw new Error(`Filtre inconnu : ${field}`);
              return result(async () => {
                await documentFor(id).delete();
                return null;
              });
            },
            in(field, ids) {
              if (field !== 'item_id') throw new Error(`Filtre inconnu : ${field}`);
              return result(async () => {
                await batchWrite(ids, 'delete');
                return null;
              });
            }
          };
        }
      };
    },
    auth: {
      getSession() {
        return result(async () => {
          await authReady;
          return { session: auth.currentUser ? { user: auth.currentUser } : null };
        });
      },
      signInWithPassword({ email, password }) {
        return result(async () => {
          const credentials = await auth.signInWithEmailAndPassword(email, password);
          return { user: credentials.user };
        });
      },
      signOut() {
        return result(async () => {
          await auth.signOut();
          return null;
        });
      },
      onAuthStateChange(callback) {
        const unsubscribe = auth.onAuthStateChanged(user => {
          callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
        });
        return { data: { subscription: { unsubscribe } } };
      }
    }
  };

  global.AlaricFirebase = Object.freeze({ config, client });
}(window));
