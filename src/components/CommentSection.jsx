import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function CommentSection({ comments, onAdd, onUpdate, onDelete, postAuthorId }) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(newComment);
      setNewComment('');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.comment);
  };

  const saveEdit = async (id) => {
    await onUpdate(id, editText);
    setEditingId(null);
  };

  return (
    <div className="mt-10">
      <h2 className="font-display text-xl text-ink mb-4">
        Comments ({comments.length})
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment…"
          maxLength={255}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-paper text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-ink-light transition disabled:opacity-50"
        >
          Post
        </button>
      </form>

      {comments.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet — be the first to write one.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => {
            const isOwnComment = user?.id === c.author?.id;
            const isPostAuthor = user?.id === postAuthorId;
            const canDelete = isOwnComment || isPostAuthor;

            return (
              <div key={c.id} className="flex gap-3">
                <img
                  src={c.author?.avatar}
                  alt={c.author?.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 bg-white border border-gray-100 rounded-xl p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-ink">
                      {c.author?.name} {c.author?.lastname}
                    </p>
                    <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                  </div>

                  {editingId === c.id ? (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                      />
                      <button onClick={() => saveEdit(c.id)} className="text-xs text-gold-dark font-medium">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">{c.comment}</p>
                  )}

                  {editingId !== c.id && (isOwnComment || canDelete) && (
                    <div className="flex gap-3 mt-2">
                      {isOwnComment && (
                        <button onClick={() => startEdit(c)} className="text-xs text-gold-dark font-medium hover:underline">
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => onDelete(c.id)} className="text-xs text-red-500 font-medium hover:underline">
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}