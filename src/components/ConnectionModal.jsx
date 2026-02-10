import { useState } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { useLivy } from "../context/LivyContext";
import { v4 as uuidv4 } from "uuid";

export default function ConnectionModal({ isOpen, onClose }) {
  const { hosts, activeHostId, addHost, removeHost, updateHost, selectHost } = useLivy();
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    addHost({ id: uuidv4(), name: newName.trim(), url: newUrl.trim() });
    setNewName("");
    setNewUrl("");
  };

  const handleEdit = (host) => {
    setEditingId(host.id);
    setEditName(host.name);
    setEditUrl(host.url);
  };

  const handleSaveEdit = (id) => {
    if (!editName.trim() || !editUrl.trim()) return;
    updateHost(id, { name: editName.trim(), url: editUrl.trim() });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Manage Livy Hosts</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-bg-tertiary)] transition-colors">
            <X size={18} className="text-[var(--color-text-secondary)]" />
          </button>
        </div>

        {/* Host List */}
        <div className="px-5 py-4 max-h-64 overflow-y-auto space-y-2">
          {hosts.map((host) => (
            <div
              key={host.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                host.id === activeHostId
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
              }`}
              onClick={() => selectHost(host.id)}
            >
              {editingId === host.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-2 py-1 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded px-2 py-1 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSaveEdit(host.id); }}
                    className="p-1 rounded hover:bg-[var(--color-bg-tertiary)]"
                  >
                    <Save size={14} className="text-[var(--color-success)]" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{host.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{host.url}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {host.id === activeHostId && (
                      <span className="text-[10px] font-medium text-[var(--color-accent)] bg-[var(--color-accent)]/20 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(host); }}
                      className="p-1 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      <Save size={14} />
                    </button>
                    {host.id !== "default" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeHost(host.id); }}
                        className="p-1 rounded hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add New Host */}
        <div className="px-5 py-4 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)] mb-2 font-medium uppercase tracking-wide">Add New Host</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name"
              className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
            />
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="http://host:8998"
              className="flex-1 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-muted)]"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !newUrl.trim()}
              className="flex items-center gap-1 px-3 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
