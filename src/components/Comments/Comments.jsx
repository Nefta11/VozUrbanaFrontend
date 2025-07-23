import { useState } from 'react'
import PropTypes from 'prop-types'
import { MessageCircle, Send, Edit3, Trash2, Save, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useReports } from '../../hooks/useReports'
import './Comments.css'

const Comments = ({ reportId, comments = [] }) => {
  const { user } = useAuth()
  const { addComment, updateComment, deleteComment } = useReports()
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [editText, setEditText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      await addComment(reportId, { texto: newComment.trim() })
      setNewComment('')
    } catch (error) {
      console.error('Error al enviar comentario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return

    setIsSubmitting(true)
    try {
      await updateComment(commentId, editText.trim(), reportId)
      setEditingComment(null)
      setEditText('')
    } catch (error) {
      console.error('Error al editar comentario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) return

    setIsSubmitting(true)
    try {
      await deleteComment(commentId, reportId)
    } catch (error) {
      console.error('Error al eliminar comentario:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEditing = (comment) => {
    setEditingComment(comment.id)
    setEditText(comment.texto)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditText('')
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Fecha inválida'
    }
  }

  return (
    <div className="comments-section">
      <div className="comments-header">
        <MessageCircle className="icon" />
        <h3>Comentarios ({comments.length})</h3>
      </div>

      {/* Add new comment */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="add-comment">
          <div className="comment-input">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu comentario..."
              rows="3"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="submit-btn"
            >
              <Send className="icon" />
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Inicia sesión para comentar</p>
        </div>
      )}

      {/* Comments list */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <MessageCircle className="icon" />
            <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <div className="comment-author">
                  <span className="author-name">{comment.usuario.nombre}</span>
                  <span className="comment-date">{formatDate(comment.fecha)}</span>
                </div>
                
                {user && user.id === comment.usuario.id && (
                  <div className="comment-actions">
                    {editingComment === comment.id ? (
                      <>
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          disabled={isSubmitting}
                          className="action-btn save"
                        >
                          <Save className="icon" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isSubmitting}
                          className="action-btn cancel"
                        >
                          <X className="icon" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(comment)}
                          disabled={isSubmitting}
                          className="action-btn edit"
                        >
                          <Edit3 className="icon" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={isSubmitting}
                          className="action-btn delete"
                        >
                          <Trash2 className="icon" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="comment-content">
                {editingComment === comment.id ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    disabled={isSubmitting}
                    rows="3"
                    className="edit-textarea"
                  />
                ) : (
                  <p>{comment.texto}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

Comments.propTypes = {
  reportId: PropTypes.number.isRequired,
  comments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    texto: PropTypes.string.isRequired,
    fecha: PropTypes.string.isRequired,
    usuario: PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired
    }).isRequired
  }))
}

export default Comments
