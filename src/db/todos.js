const DATABASE_NAME = 'grace-todo-list'
const DATABASE_VERSION = 3
const STORE_NAME = 'todos'
const META_STORE_NAME = 'meta'
const LEGACY_STORAGE_KEY = 'grace-todo-list'

let databasePromise

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

      request.onupgradeneeded = () => {
        const database = request.result
        const transaction = request.transaction
        const todos =
          database.objectStoreNames.contains(STORE_NAME)
            ? transaction.objectStore(STORE_NAME)
            : database.createObjectStore(STORE_NAME, { keyPath: 'id' })
        const metadata =
          database.objectStoreNames.contains(META_STORE_NAME)
            ? transaction.objectStore(META_STORE_NAME)
            : database.createObjectStore(META_STORE_NAME, { keyPath: 'key' })

        todos.clear()
        metadata.put({ key: 'initialized' })
      }
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close()
        resolve(request.result)
      }
      request.onerror = () => reject(request.error)
      request.onblocked = () => reject(new Error('La base de données des tâches est bloquée.'))
    })
  }

  return databasePromise
}

function readAllTodos(database) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const request = transaction.objectStore(STORE_NAME).getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

export async function loadTodos() {
  const database = await openDatabase()
  const todos = await readAllTodos(database)
  localStorage.removeItem(LEGACY_STORAGE_KEY)
  return todos
}

export async function updateTodos(updater) {
  const database = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()
    let updatedTodos

    request.onsuccess = () => {
      updatedTodos = updater(request.result)
      store.clear()
      updatedTodos.forEach((todo) => store.put(todo))
    }
    request.onerror = () => reject(request.error)
    transaction.oncomplete = () => resolve(updatedTodos)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}
