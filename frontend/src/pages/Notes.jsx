import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Notes() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' });
        if (authRes.ok) {
          const userData = await authRes.json();
          setUser(userData);
        }

        const notesRes = await fetch(`${BACKEND_URL}/api/notes`);
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(notesData);
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupedNotes = notes.reduce((acc, note) => {
    if (!acc[note.subject]) {
      acc[note.subject] = [];
    }
    acc[note.subject].push(note);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-primary" />
            <h1 className="font-outfit font-bold text-4xl" data-testid="notes-title">
              <span className="gradient-text">Notes</span> & Resources
            </h1>
          </div>
          <p className="text-text-secondary">Course materials aur study resources download karein</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <Card className="bg-background-surface border border-white/10 p-12 text-center">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="font-outfit font-medium text-xl mb-2">No Notes Available</h3>
            <p className="text-text-secondary">Notes abhi upload nahi kiye gaye hain</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedNotes).map((subject) => (
              <div key={subject}>
                <h2 className="font-outfit font-bold text-2xl mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  {subject}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedNotes[subject].map((note) => (
                    <Card
                      key={note.note_id}
                      data-testid={`note-card-${note.note_id}`}
                      className="bg-background-surface border border-white/10 p-6 hover:border-primary/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <span className="font-mono text-xs uppercase px-2 py-1 bg-primary/10 border border-primary/20 text-primary">
                          {note.file_type}
                        </span>
                      </div>
                      <h3 className="font-outfit font-medium text-lg mb-2 text-white">{note.title}</h3>
                      {note.description && (
                        <p className="text-sm text-text-secondary mb-4 line-clamp-2">{note.description}</p>
                      )}
                      <Button
                        data-testid={`download-note-${note.note_id}`}
                        onClick={() => window.open(note.file_url, '_blank')}
                        className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-background"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}