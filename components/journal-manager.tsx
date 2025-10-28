"use client";

import { useState, useMemo } from "react";
import { JournalEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Tag, Edit2, Trash2, X } from "lucide-react";
import { useToast } from "@/components/toast";

interface JournalManagerProps {
  journals: JournalEntry[];
  onEdit: (id: string, content: string, tags?: string[]) => void;
  onDelete: (id: string) => void;
}

export function JournalManager({ journals, onEdit, onDelete }: JournalManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const { showToast, showConfirm } = useToast();

  // Extract all unique tags from journals
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    journals.forEach(j => {
      j.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [journals]);

  // Filter journals based on search and tag
  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      const matchesSearch = searchQuery.trim() === '' ||
        journal.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag = selectedTag === null ||
        journal.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [journals, searchQuery, selectedTag]);

  const sortedJournals = useMemo(() => {
    return [...filteredJournals].sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredJournals]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      weekday: 'short'
    });
  };

  const handleEdit = (journal: JournalEntry) => {
    setEditingId(journal.id);
    setEditContent(journal.content);
    setEditTags(journal.tags || []);
    setNewTag('');
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onEdit(editingId, editContent, editTags);
      setEditingId(null);
      setEditContent('');
      setEditTags([]);
      showToast('Journal entry updated', 'success');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
    setEditTags([]);
    setNewTag('');
  };

  const handleDelete = (id: string) => {
    showConfirm(
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      () => {
        onDelete(id);
        showToast('Journal entry deleted', 'success');
      }
    );
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold mt-3 mb-1">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-semibold mt-3 mb-1">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        }
        // Bold and italic
        let processed = line;
        processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');
        processed = processed.replace(/__(.+?)__/g, '<strong>$1</strong>');
        processed = processed.replace(/_(.+?)_/g, '<em>$1</em>');

        return (
          <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: processed }} />
        );
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Entries</CardTitle>
        <div className="space-y-3 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search journal entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Filter:
              </span>
              <Button
                variant={selectedTag === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}

          {/* Results count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredJournals.length} of {journals.length} entries
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedJournals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {searchQuery || selectedTag
              ? 'No journal entries match your search criteria.'
              : 'No journal entries yet. Start writing to see them here!'}
          </p>
        ) : (
          <div className="space-y-4">
            {sortedJournals.map(journal => (
              <div
                key={journal.id}
                className="p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
              >
                {editingId === journal.id ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[150px] p-3 rounded-md border bg-background resize-y"
                      placeholder="Write your thoughts..."
                    />
                    <div className="text-xs text-muted-foreground">
                      {editContent.length} characters
                    </div>

                    {/* Tag Management */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button onClick={handleAddTag} size="sm" disabled={!newTag.trim()}>
                          Add Tag
                        </Button>
                      </div>
                      {editTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {editTags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:bg-primary/20 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} disabled={!editContent.trim()}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm text-muted-foreground">
                        {formatDate(journal.date)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(journal)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(journal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {journal.tags && journal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {journal.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {renderMarkdown(journal.content)}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
