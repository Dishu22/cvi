import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, BookOpen, FileText, Mail, Shield, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingStudents, setPendingStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [studentsRes, coursesRes, notesRes, inquiriesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/pending-students`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/courses`),
        fetch(`${BACKEND_URL}/api/notes`),
        fetch(`${BACKEND_URL}/api/admin/inquiries`, { credentials: 'include' })
      ]);

      if (studentsRes.ok) setPendingStudents(await studentsRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());
      if (inquiriesRes.ok) setInquiries(await inquiriesRes.json());
    } catch (error) {
      toast.error('Failed to load data');
      navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/approve-student/${registrationId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Student approved!');
        setPendingStudents(pendingStudents.filter(s => s.registration_id !== registrationId));
      }
    } catch (error) {
      toast.error('Failed to approve student');
    }
  };

  const handleReject = async (registrationId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/reject-student/${registrationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Student rejected');
        setPendingStudents(pendingStudents.filter(s => s.registration_id !== registrationId));
      }
    } catch (error) {
      toast.error('Failed to reject student');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Course deleted');
        setCourses(courses.filter(c => c.course_id !== courseId));
      }
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Note deleted');
        setNotes(notes.filter(n => n.note_id !== noteId));
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleLogout = async () => {
    await fetch(`${BACKEND_URL}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    toast.success('Logged out');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-white/10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(24px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="font-outfit font-bold text-xl">
              <span className="text-primary">Admin</span> Dashboard
            </h1>
          </div>
          <Button onClick={handleLogout} variant="ghost" className="text-text-secondary hover:text-white">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="bg-background-surface border border-white/10">
            <TabsTrigger value="students" data-testid="tab-students">
              <Users className="w-4 h-4 mr-2" />
              Pending Students ({pendingStudents.length})
            </TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-courses">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="notes" data-testid="tab-notes">
              <FileText className="w-4 h-4 mr-2" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="inquiries" data-testid="tab-inquiries">
              <Mail className="w-4 h-4 mr-2" />
              Inquiries ({inquiries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            {pendingStudents.length === 0 ? (
              <Card className="bg-background-surface border border-white/10 p-12 text-center">
                <Users className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No pending approvals</p>
              </Card>
            ) : (
              pendingStudents.map((student) => (
                <Card key={student.registration_id} className="bg-background-surface border border-white/10 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-outfit font-medium text-lg text-white mb-2">{student.name}</h3>
                      <div className="space-y-1 text-sm text-text-secondary">
                        <p>Email: {student.email}</p>
                        <p>Phone: {student.phone}</p>
                        <p>Course: {student.course_interest}</p>
                        {student.message && <p className="italic">Message: {student.message}</p>}
                        <p className="text-xs text-text-muted">Submitted: {new Date(student.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-testid={`approve-${student.registration_id}`}
                        onClick={() => handleApprove(student.registration_id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        data-testid={`reject-${student.registration_id}`}
                        onClick={() => handleReject(student.registration_id)}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <AddCourseDialog onSuccess={(newCourse) => setCourses([newCourse, ...courses])} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <Card key={course.course_id} className="bg-background-surface border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-outfit font-medium text-lg text-white">{course.title}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteCourse(course.course_id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <p>Category: {course.category}</p>
                    <p>Duration: {course.duration}</p>
                    <p>Price: {course.price}</p>
                    <p>Rating: {course.rating} ⭐</p>
                    <p>Students: {course.students}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <AddNoteDialog onSuccess={(newNote) => setNotes([newNote, ...notes])} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notes.map((note) => (
                <Card key={note.note_id} className="bg-background-surface border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNote(note.note_id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <h3 className="font-outfit font-medium text-lg text-white mb-2">{note.title}</h3>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <p>Subject: {note.subject}</p>
                    <p>Type: {note.file_type}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inquiries" className="space-y-4">
            {inquiries.length === 0 ? (
              <Card className="bg-background-surface border border-white/10 p-12 text-center">
                <Mail className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">No inquiries yet</p>
              </Card>
            ) : (
              inquiries.map((inquiry) => (
                <Card key={inquiry.inquiry_id} className="bg-background-surface border border-white/10 p-6">
                  <h3 className="font-outfit font-medium text-lg text-white mb-2">{inquiry.name}</h3>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <p>Email: {inquiry.email}</p>
                    {inquiry.phone && <p>Phone: {inquiry.phone}</p>}
                    {inquiry.course_interest && <p>Interested in: {inquiry.course_interest}</p>}
                    {inquiry.message && <p className="italic mt-2">Message: {inquiry.message}</p>}
                    <p className="text-xs text-text-muted mt-2">Received: {new Date(inquiry.created_at).toLocaleString()}</p>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AddCourseDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: '', duration: '', price: '', rating: 4.5, students: 0, image: '', description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newCourse = await res.json();
        toast.success('Course added!');
        onSuccess(newCourse);
        setOpen(false);
        setFormData({ title: '', category: '', duration: '', price: '', rating: 4.5, students: 0, image: '', description: '' });
      }
    } catch (error) {
      toast.error('Failed to add course');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="add-course-button" className="bg-primary text-background">
          <Plus className="w-4 h-4 mr-2" /> Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background-surface border border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-outfit text-2xl">Add New Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label>Title *</Label>
            <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-background border-white/20 text-white" />
          </div>
          <div>
            <Label>Category *</Label>
            <Input required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="bg-background border-white/20 text-white" placeholder="Technology, Design, etc." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration *</Label>
              <Input required value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="bg-background border-white/20 text-white" placeholder="6 Months" />
            </div>
            <div>
              <Label>Price *</Label>
              <Input required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="bg-background border-white/20 text-white" placeholder="₹15,000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rating</Label>
              <Input type="number" step="0.1" value={formData.rating} onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})} className="bg-background border-white/20 text-white" />
            </div>
            <div>
              <Label>Students</Label>
              <Input type="number" value={formData.students} onChange={(e) => setFormData({...formData, students: parseInt(e.target.value)})} className="bg-background border-white/20 text-white" />
            </div>
          </div>
          <div>
            <Label>Image URL *</Label>
            <Input required value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="bg-background border-white/20 text-white" placeholder="https://..." />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-background border-white/20 text-white" rows={3} />
          </div>
          <Button type="submit" className="w-full bg-primary text-background">Add Course</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddNoteDialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', subject: '', file_url: '', file_type: 'pdf', description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newNote = await res.json();
        toast.success('Note added!');
        onSuccess(newNote);
        setOpen(false);
        setFormData({ title: '', subject: '', file_url: '', file_type: 'pdf', description: '' });
      }
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="add-note-button" className="bg-primary text-background">
          <Plus className="w-4 h-4 mr-2" /> Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background-surface border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-outfit text-2xl">Add New Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-background border-white/20 text-white" />
          </div>
          <div>
            <Label>Subject *</Label>
            <Input required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="bg-background border-white/20 text-white" placeholder="Web Development, Data Science, etc." />
          </div>
          <div>
            <Label>File URL *</Label>
            <Input required value={formData.file_url} onChange={(e) => setFormData({...formData, file_url: e.target.value})} className="bg-background border-white/20 text-white" placeholder="https://..." />
          </div>
          <div>
            <Label>File Type</Label>
            <Input value={formData.file_type} onChange={(e) => setFormData({...formData, file_type: e.target.value})} className="bg-background border-white/20 text-white" placeholder="pdf, pptx, etc." />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-background border-white/20 text-white" rows={3} />
          </div>
          <Button type="submit" className="w-full bg-primary text-background">Add Note</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
