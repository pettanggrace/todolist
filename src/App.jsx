import { useEffect, useMemo, useState } from 'react'
import { loadTodos, updateTodos } from './db/todos'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState('toutes')

  const filters = [
    { value: 'toutes', label: 'Toutes' },
    { value: 'actives', label: 'À faire' },
    { value: 'terminees', label: 'Terminées' },
  ]

  useEffect(() => {
    let isMounted = true

    loadTodos()
      .then((savedTodos) => {
        if (isMounted) setTodos(savedTodos)
      })
      .catch((loadError) => {
        console.error('Erreur lors du chargement des tâches :', loadError)
        if (isMounted) {
          setError('Impossible de charger les tâches. Vérifiez le stockage du navigateur puis rechargez la page.')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const persistTodos = async (updater) => {
    try {
      const updatedTodos = await updateTodos(updater)
      setTodos(updatedTodos)
      setError('')
    } catch (saveError) {
      console.error('Erreur lors de l’enregistrement des tâches :', saveError)
      setError('Impossible d’enregistrer les tâches. Vérifiez le stockage du navigateur puis réessayez.')
    }
  }

  const remainingTodos = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  )
  const remainingLabel = remainingTodos === 1 ? 'tâche restante' : 'tâches restantes'
  const totalLabel = todos.length === 1 ? 'tâche au total' : 'tâches au total'

  const filteredTodos = useMemo(() => {
    if (filter === 'actives') return todos.filter((todo) => !todo.completed)
    if (filter === 'terminees') return todos.filter((todo) => todo.completed)
    return todos
  }, [filter, todos])

  const handleAddTodo = (event) => {
    event.preventDefault()

    const value = newTodo.trim()
    if (!value) return

    void persistTodos((currentTodos) => [
      { id: Date.now() + Math.random(), text: value, completed: false },
      ...currentTodos,
    ])
    setNewTodo('')
  }

  const toggleTodo = (id) => {
    void persistTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  const deleteTodo = (id) => {
    void persistTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id))
  }

  const clearCompleted = () => {
    void persistTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed))
  }

  return (
    <main className="app-shell">
      <section className="todo-card">
        <header className="todo-header">
          <div>
            <p className="eyebrow">Aujourd’hui</p>
            <h1>TO DO LIST</h1>
          </div>
          <span className="todo-count">{remainingTodos} {remainingLabel}</span>
        </header>

        <form className="todo-form" onSubmit={handleAddTodo}>
          <input
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Ajouter une tâche..."
            aria-label="Ajouter une tâche"
            disabled={isLoading || Boolean(error)}
          />
          <button type="submit" disabled={isLoading || Boolean(error)}>Ajouter</button>
        </form>

        {error && <p className="error-message" role="alert">{error}</p>}

        <nav className="filters" aria-label="Filtres des tâches">
          {filters.map((option) => (
            <button
              key={option.value}
              type="button"
              className={filter === option.value ? 'filter active' : 'filter'}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </nav>

        <ul className="todo-list" aria-live="polite">
          {isLoading ? (
            <li className="empty-state">Chargement des tâches...</li>
          ) : filteredTodos.length === 0 ? (
            <li className="empty-state">Aucune tâche pour le moment.</li>
          ) : (
            filteredTodos.map((todo) => (
              <li key={todo.id} className={todo.completed ? 'todo-item completed' : 'todo-item'}>
                <label className="todo-label">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    disabled={Boolean(error)}
                  />
                  <span>{todo.text}</span>
                </label>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`Supprimer ${todo.text}`}
                  disabled={Boolean(error)}
                >
                  Supprimer
                </button>
              </li>
            ))
          )}
        </ul>

        <footer className="todo-footer">
          <span>{todos.length} {totalLabel}</span>
          <button type="button" onClick={clearCompleted} disabled={Boolean(error) || todos.every((todo) => !todo.completed)}>
            Supprimer les tâches terminées
          </button>
        </footer>
      </section>
    </main>
  )
}

export default App
