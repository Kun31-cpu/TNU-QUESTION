import React, { useState, useEffect, useRef } from "react";
import { 
  Search, BookOpen, Clock, UploadCloud, ShieldCheck, Filter, 
  ZoomIn, ZoomOut, Trash2, Library, BookOpenCheck, Calendar, 
  ArrowUpRight, Check, X, FileText, Image as ImageIcon, Sparkles, 
  ChevronRight, GraduationCap, Download, Printer, Copy,
  Star, MessageSquare, Bot, Cpu, Lock, Unlock, Bookmark, Send,
  HelpCircle, Eye, AlertCircle
} from "lucide-react";
import { Paper, Department, Subject, User } from "./types";

interface Toast {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'info';
}

export default function App() {
  // Application Roles / Persona state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Admin credentials verification form states
  const [adminEmailInput, setAdminEmailInput] = useState<string>("");
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Student Bookmark list state (persisted locally)
  const [savedBookmarks, setSavedBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tnu_saved_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);

  // Tab control inside Selected Paper details Modal
  const [modalActiveTab, setModalActiveTab] = useState<'questions' | 'ai-buddy' | 'predictor' | 'discussion'>('questions');

  // Real Classroom Discussions / Comments state
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>("");
  const [commentIsSubmitting, setCommentIsSubmitting] = useState<boolean>(false);

  // Neotia Prep-GPT AI tutor chat thread state
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'user' | 'ai', text: string }>>([]);
  const [aiChatInput, setAiChatInput] = useState<string>("");
  const [aiChatLoading, setAiChatLoading] = useState<boolean>(false);

  // AI trends and predictor tips state
  const [predictedTips, setPredictedTips] = useState<string[]>([]);
  const [predictedLoading, setPredictedLoading] = useState<boolean>(false);
  
  // DB metadata states
  const [papers, setPapers] = useState<Paper[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [toastList, setToastList] = useState<Toast[]>([]);
  
  // Filter settings
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedSem, setSelectedSem] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');

  // Selected paper in Visual Previewer Modal
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Admin Upload form state
  const [formDeptName, setFormDeptName] = useState("Computer Science & Engineering");
  const [formSubjectName, setFormSubjectName] = useState("");
  const [formSubjectCode, setFormSubjectCode] = useState("");
  const [formSemester, setFormSemester] = useState("1");
  const [formYear, setFormYear] = useState("2025");
  const [formExamType, setFormExamType] = useState<"Midterm" | "Final">("Final");
  const [formTags, setFormTags] = useState("");
  
  // Custom printed exam sheet builder state
  const [uploadedBase64, setUploadedBase64] = useState<string>("");
  const [imageFileName, setImageFileName] = useState<string>("");
  const [questionTextarea, setQuestionTextarea] = useState<string>(
    "1. Discuss standard recursive state definitions in application algorithms.\n2. Deduce mathematical formulations of theorems.\n3. Design a system architecture addressing industrial specifications."
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add toast alerts
  const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = "toast-" + Date.now();
    setToastList(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToastList(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Auto sign-in helper
  const handleAutoAuth = async (asAdmin: boolean) => {
    const email = asAdmin ? "admin@neotia.edu.in" : "student@neotia.edu.in";
    const password = asAdmin ? "admin2026" : "password123";
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("univault_token", data.token);
        setUser(data.user);
      }
    } catch (err) {
      console.error("Auth helper failure:", err);
    }
  };

  // Log in to administrator mode specifically
  const handleAdminSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmailInput.trim() || !adminPasswordInput.trim()) {
      addToast("Please enter registrar email & secure credential.", "error");
      return;
    }

    setIsAuthenticating(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmailInput.trim(), password: adminPasswordInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("univault_token", data.token);
        setUser(data.user);
        addToast("Lock verified! Neotia Registrar authority authorized.", "success");
        setAdminEmailInput("");
        setAdminPasswordInput("");
      } else {
        addToast(data.error || "Access denied. Invalid academic credentials.", "error");
      }
    } catch (err) {
      addToast("Friction entering verification loop.", "error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Load paper-specific active nodes (comments, GPT, predictor tips)
  useEffect(() => {
    if (selectedPaper) {
      setModalActiveTab('questions');
      setAiChatMessages([
        { sender: 'ai', text: `👋 Greetings! I am Neotia Prep-GPT. You can ask me to solve any syllabus question on "${selectedPaper.subjectName}", explain core formulas, or outline revision tips!` }
      ]);
      setPredictedTips([]);
      fetchComments(selectedPaper.id);
    }
  }, [selectedPaper]);

  // Fetch real comments from database
  const fetchComments = async (paperId: string) => {
    setIsCommentsLoading(true);
    try {
      const res = await fetch(`/api/papers/${paperId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data || []);
      }
    } catch (err) {
      console.error("Comments fetch error:", err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  // Submit classroom discussion peer comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper || !commentInput.trim()) return;

    setCommentIsSubmitting(true);
    const token = localStorage.getItem("univault_token");
    try {
      const res = await fetch(`/api/papers/${selectedPaper.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ comment: commentInput })
      });
      const data = await res.json();
      if (res.ok) {
        addToast("Comment successfully published!", "success");
        setCommentInput("");
        fetchComments(selectedPaper.id);
        
        // Dynamically increment comment count locally
        setPapers(prev => prev.map(p => p.id === selectedPaper.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      } else {
        addToast(data.error || "Could not publish comment.", "error");
      }
    } catch (err) {
      addToast("Failed publishing comment state.", "error");
    } finally {
      setCommentIsSubmitting(false);
    }
  };

  // Pull real time predictions from server-side Gemini
  const handleLoadPredictions = async () => {
    if (!selectedPaper) return;
    setPredictedLoading(true);
    const token = localStorage.getItem("univault_token");
    try {
      const res = await fetch(`/api/papers/${selectedPaper.id}/predict`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPredictedTips(data.tips || []);
        addToast("Predicted study tips generated via Gemini!", "success");
      } else {
        addToast("Failed loading predictions advice.", "error");
      }
    } catch (err) {
      addToast("Network failure reading predictions.", "error");
    } finally {
      setPredictedLoading(false);
    }
  };

  // Chat with Neotia Prep-GPT AI Study Companion
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaper || !aiChatInput.trim() || aiChatLoading) return;

    const userMsg = aiChatInput.trim();
    setAiChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiChatInput("");
    setAiChatLoading(true);

    const token = localStorage.getItem("univault_token");
    try {
      const fullPrompt = `TNU Course Material Context: Course Subject: ${selectedPaper.subjectName} (Code: ${selectedPaper.subjectCode}), Semester: ${selectedPaper.semester}, Year: ${selectedPaper.year}. The questions on this past exam paper are: ${selectedPaper.questions ? selectedPaper.questions.map((q, i) => `Q${i+1}: ${q}`).join('; ') : 'not found'}. Question: ${userMsg}`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: fullPrompt })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setAiChatMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setAiChatMessages(prev => [...prev, { sender: 'ai', text: data.error || "Greetings! The model server fallback returned advice. Try again or check process key bounds." }]);
      }
    } catch (err) {
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: "Error connecting to AI chat pipelines. Please check dev port logs." }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  // Toggle student bookmark reference sheet
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (savedBookmarks.includes(id)) {
      updated = savedBookmarks.filter(item => item !== id);
      addToast("Paper removed from reference stack.", "info");
    } else {
      updated = [...savedBookmarks, id];
      addToast("Exam booklet added to Study bookmarks!", "success");
    }
    setSavedBookmarks(updated);
    localStorage.setItem("tnu_saved_bookmarks", JSON.stringify(updated));
  };

  // Load backend content
  const loadDatabase = async () => {
    try {
      const pRes = await fetch("/api/papers");
      if (pRes.ok) {
        const pData = await pRes.json();
        setPapers(pData.papers || []);
      }
      const dRes = await fetch("/api/departments");
      if (dRes.ok) {
        const dData = await dRes.json();
        setDepartments(dData);
      }
    } catch (e) {
      console.error("Database fetch error:", e);
    }
  };

  // Perform initial configurations (Auto sign-in as student student@neotia.edu.in for seamless experience)
  useEffect(() => {
    handleAutoAuth(false).then(() => {
      loadDatabase();
    });
  }, []);

  // Handle uploading files and converting to Base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Invalid file format. Please upload an image picture (PNG, JPG, or WEBP) of the question paper.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedBase64(reader.result as string);
      setImageFileName(file.name);
      addToast(`Ready! Captured "${file.name}" question sheet picture.`, "success");
    };
    reader.readAsDataURL(file);
  };

  // Dynamic SVG builder that generates beautiful visual TNU exam papers on-the-fly for pristine student reviews!
  const handleGenerateExamSheet = () => {
    if (!formSubjectName || !formSubjectCode) {
      addToast("Please fill in the Subject Name and Subject Code to generate a paper template.", "info");
      return;
    }

    const questionsList = questionTextarea
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0);

    const questionsSVGText = questionsList.map((q, idx) => {
      const yPos = 270 + idx * 55;
      // Truncate logic if lines are too long
      const textLine1 = q.length > 68 ? q.slice(0, 68) : q;
      const textLine2 = q.length > 68 ? q.slice(68) : "";
      
      return `
        <text x="40" y="${yPos}" font-size="12" font-weight="700" fill="#0f172a">Q${idx + 1}.</text>
        <text x="70" y="${yPos}" font-size="12" fill="#334155">${textLine1}</text>
        ${textLine2 ? `<text x="70" y="${yPos + 18}" font-size="12" fill="#334155">${textLine2}</text>` : ""}
      `;
    }).join("\n");

    const builtSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" style="background:#fcfbf7; font-family:system-ui, -apple-system, sans-serif;">
        <rect width="100%" height="100%" fill="#fcfbf7" />
        <rect x="15" y="15" width="570" height="720" fill="none" stroke="#0a2240" stroke-width="1.5" stroke-dasharray="4" opacity="0.4"/>
        
        <text x="300" y="65" font-size="20" font-weight="900" text-anchor="middle" fill="#0a2240" letter-spacing="1">THE NEOTIA UNIVERSITY</text>
        <text x="300" y="85" font-size="10" font-weight="700" text-anchor="middle" fill="#dfaa18" letter-spacing="2">SARISHA, WEST BENGAL &bull; ESTD 2015</text>
        
        <line x1="40" y1="105" x2="560" y2="105" stroke="#0a2240" stroke-width="2" />
        <line x1="40" y1="109" x2="560" y2="109" stroke="#0a2240" stroke-dasharray="1 3" stroke-width="1" />
        
        <text x="40" y="135" font-size="11" font-weight="700" fill="#475569">DEPARTMENT: ${formDeptName.toUpperCase()}</text>
        <text x="560" y="135" font-size="11" font-weight="700" text-anchor="end" fill="#475569">SEMESTER: ${formSemester}</text>
        
        <text x="40" y="160" font-size="12" font-weight="800" fill="#0a2240">COURSE: ${formSubjectName.toUpperCase()}</text>
        <text x="560" y="160" font-size="12" font-weight="800" text-anchor="end" fill="#0a2240">CODE: ${formSubjectCode.toUpperCase()}</text>
        
        <text x="40" y="185" font-size="11" font-style="italic" fill="#64748b">Time Allowed: 3 Hours</text>
        <text x="560" y="185" font-size="11" font-weight="700" text-anchor="end" fill="#0a2240">YEAR: ${formYear} | MARKS: 100</text>
        
        <line x1="40" y1="200" x2="560" y2="200" stroke="#cbd5e1" />
        
        <text x="40" y="230" font-size="12" font-weight="800" fill="#0a2240" decoration="underline">GROUP A — ANSWER ALL QUESTIONS (25 Marks each)</text>
        
        ${questionsSVGText}
        
        <!-- Footer watermark -->
        <line x1="40" y1="670" x2="560" y2="670" stroke="#0a2240" stroke-width="0.75" />
        <text x="300" y="695" font-size="9" font-weight="bold" text-anchor="middle" fill="#64748b">--- END OF QUESTION SHEET ---</text>
        <text x="300" y="712" font-size="7" text-anchor="middle" fill="#94a3b8">The Neotia University Question Archival System &bull; Confidential Copy</text>
      </svg>
    `)}`;

    setUploadedBase64(builtSVG);
    setImageFileName(`Dynamic_TNU_${formSubjectCode || "Exam"}.svg`);
    addToast("Generated fresh, print-ready question paper visual!", "success");
  };

  // Clear upload form
  const handleResetForm = () => {
    setFormSubjectName("");
    setFormSubjectCode("");
    setFormSemester("1");
    setFormYear("2026");
    setFormTags("");
    setUploadedBase64("");
    setImageFileName("");
  };

  // Submit Paper
  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubjectName || !formSubjectCode || !uploadedBase64) {
      addToast("Please complete the Subject name/code and attach or generate a visual picture first.", "error");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("univault_token");

    const payload = {
      title: `TNU ${formSubjectName} ${formSemester}nd Sem ${formYear} Paper`,
      department: formDeptName,
      semester: parseInt(formSemester, 10),
      subjectName: formSubjectName,
      subjectCode: formSubjectCode,
      university: "The Neotia University",
      year: parseInt(formYear, 10),
      examType: formExamType,
      tags: formTags.split(",").map(t => t.trim()).filter(Boolean),
      fileName: imageFileName || "Exam_Booklet_Picture.png",
      fileSize: "280 KB",
      mockQuestions: questionTextarea.split("\n").filter(Boolean),
      picture: uploadedBase64
    };

    try {
      const res = await fetch("/api/papers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        addToast(`Successfully archived past paper visual for "${formSubjectName}"!`, "success");
        handleResetForm();
        loadDatabase();
      } else {
        addToast(data.error || "Failed to catalog paper.", "error");
      }
    } catch (err) {
      addToast("Failed uploading picture connection stream.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Paper (Admin Feature)
  const handleDeletePaper = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this question paper? This is irreversible.")) return;

    const token = localStorage.getItem("univault_token");
    try {
      const res = await fetch(`/api/admin/papers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        addToast("Question paper visual permanently purged.", "success");
        loadDatabase();
        if (selectedPaper?.id === id) {
          setSelectedPaper(null);
        }
      } else {
        addToast("Failed to delete exam archive.", "error");
      }
    } catch (err) {
      addToast("Network failure interfacing delete API.", "error");
    }
  };

  // Copy questions from modal to clipboard
  const handleCopyQuestions = () => {
    if (!selectedPaper?.questions) return;
    const text = selectedPaper.questions.map((q, i) => `Q${i+1}: ${q}`).join("\n");
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    addToast("Questions copied securely to clipboard!", "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Print modal paper container
  const handlePrintPaper = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      addToast("Please allow pop-ups to print this paper.", "error");
      return;
    }
    const picSrc = selectedPaper?.picture || generateFallbackPaperPic(selectedPaper!);
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedPaper?.title}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${picSrc}" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Generate gorgeous procedural fallback SVG if pre-seeded data lacks "picture" field
  const generateFallbackPaperPic = (paper: Paper) => {
    const questionsList = paper.questions || [
      "Explain the key concepts of this program.",
      "Deduce relational equations.",
      "Evaluate structural constraints."
    ];
    
    const questionsSVGText = questionsList.map((q, idx) => {
      const yPos = 270 + idx * 55;
      const textLine1 = q.length > 70 ? q.slice(0, 70) : q;
      const textLine2 = q.length > 70 ? q.slice(70) : "";
      
      return `
        <text x="40" y="${yPos}" font-size="12" font-weight="700" fill="#0f172a">Q${idx + 1}.</text>
        <text x="70" y="${yPos}" font-size="12" fill="#334155">${textLine1}</text>
        ${textLine2 ? `<text x="70" y="${yPos + 18}" font-size="12" fill="#334155">${textLine2}</text>` : ""}
      `;
    }).join("\n");

    const tnuLogoSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" style="background:#fcfbf7; font-family:system-ui, -apple-system, sans-serif;">
        <rect width="100%" height="100%" fill="#fcfbf7" />
        <rect x="15" y="15" width="570" height="720" fill="none" stroke="#0a2240" stroke-width="1.5" stroke-dasharray="4" opacity="0.4"/>
        
        <text x="300" y="65" font-size="20" font-weight="900" text-anchor="middle" fill="#0a2240" letter-spacing="1">THE NEOTIA UNIVERSITY</text>
        <text x="300" y="85" font-size="10" font-weight="700" text-anchor="middle" fill="#dfaa18" letter-spacing="2">SARISHA, WEST BENGAL &bull; ESTD 2015</text>
        
        <line x1="40" y1="105" x2="560" y2="105" stroke="#0a2240" stroke-width="2" />
        <line x1="40" y1="109" x2="560" y2="109" stroke="#0a2240" stroke-dasharray="1 3" stroke-width="1" />
        
        <text x="40" y="135" font-size="11" font-weight="700" fill="#475569">DEPARTMENT: ${paper.department.toUpperCase()}</text>
        <text x="560" y="135" font-size="11" font-weight="700" text-anchor="end" fill="#475569">SEMESTER: ${paper.semester}</text>
        
        <text x="40" y="160" font-size="12" font-weight="800" fill="#0a2240">COURSE: ${paper.subjectName.toUpperCase()}</text>
        <text x="560" y="160" font-size="12" font-weight="800" text-anchor="end" fill="#0a2240">CODE: ${paper.subjectCode.toUpperCase()}</text>
        
        <text x="40" y="185" font-size="11" font-style="italic" fill="#64748b">Time Allowed: 3 Hours</text>
        <text x="560" y="185" font-size="11" font-weight="700" text-anchor="end" fill="#0a2240">YEAR: ${paper.year} | MARKS: 100</text>
        
        <line x1="40" y1="200" x2="560" y2="200" stroke="#cbd5e1" />
        
        <text x="40" y="230" font-size="12" font-weight="800" fill="#0a2240" decoration="underline">GROUP A — ANSWER ALL QUESTIONS (25 Marks each)</text>
        
        ${questionsSVGText}
        
        <!-- Footer watermark -->
        <line x1="40" y1="670" x2="560" y2="670" stroke="#0a2240" stroke-width="0.75" />
        <text x="300" y="695" font-size="9" font-weight="bold" text-anchor="middle" fill="#64748b">--- END OF QUESTION SHEET ---</text>
        <text x="300" y="712" font-size="7" text-anchor="middle" fill="#94a3b8">The Neotia University Question Archival System &bull; Confidential Copy</text>
      </svg>
    `)}`;
    return tnuLogoSVG;
  };

  // Filtering Logic
  const filteredPapersList = papers.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesDept = selectedDept === "All" || p.department === selectedDept;
    const matchesSem = !selectedSem || p.semester === parseInt(selectedSem, 10);
    const matchesYear = !selectedYear || p.year === parseInt(selectedYear, 10);
    const matchesExam = !selectedExamType || p.examType.toLowerCase() === selectedExamType.toLowerCase();
    
    // Check if we should only display bookmarked papers
    const matchesBookmark = !showBookmarkedOnly || savedBookmarks.includes(p.id);

    return matchesSearch && matchesDept && matchesSem && matchesYear && matchesExam && matchesBookmark;
  }).sort((a, b) => {
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-900">
      
      {/* Visual Toast Notifications */}
      <div id="tnu-toast-container" className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm w-full">
        {toastList.map(toast => (
          <div 
            key={toast.id}
            id={toast.id}
            className={`p-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 border animate-in slide-in-from-bottom-5 ${
              toast.type === "success" 
                ? "bg-slate-950 border-emerald-500/30 text-emerald-400" 
                : toast.type === "error" 
                ? "bg-slate-950 border-rose-500/30 text-rose-400" 
                : "bg-slate-950 border-amber-500/30 text-amber-400"
            }`}
          >
            {toast.type === "success" ? <Check className="h-4 w-4 shrink-0 animate-bounce" /> : <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />}
            <span className="text-xs font-semibold">{toast.msg}</span>
          </div>
        ))}
      </div>

      {/* Main Brand-Anchored Premium Header */}
      <header id="tnu-global-header" className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo with genuine branding labels */}
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-amber-500 rounded-xl text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans sm:text-xl">THE NEOTIA UNIVERSITY</span>
                <span className="hidden sm:inline-block text-[9px] font-mono font-extrabold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">TNU PORTAL</span>
              </div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">Question Paper Archive Hub</p>
            </div>
          </div>

          {/* Quick Dual Mode Toggle (Super Clean Switcher for frictionless visual evaluation) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              id="switch-student-btn"
              onClick={() => {
                setIsAdminMode(false);
                addToast("Switched to Student Archives Mode", "info");
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                !isAdminMode 
                  ? "bg-amber-500 text-slate-950 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Library className="h-3.5 w-3.5" />
              <span>Student View</span>
            </button>
            <button
              id="switch-admin-btn"
              onClick={() => {
                setIsAdminMode(true);
                addToast("Switched to Registrar's Admin Panel", "info");
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                isAdminMode 
                  ? "bg-amber-500 text-slate-950 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Welcome banner tailored for Neotia University */}
      <section className="bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800/60 py-8 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-[radial-gradient(circle_at_center,rgba(223,170,24,0.03),transparent)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto z-10 relative">
          <p className="text-xs font-mono tracking-widest text-amber-500 font-bold uppercase mb-2">Exams &amp; Evaluation Cell</p>
          <h1 className="text-3xl sm:text-4.5xl font-extrabold tracking-tight text-white leading-none">
            TNU Question Repository System
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2.5">
            {isAdminMode 
              ? "Administrator panel to instantly verify, catalog, design and upload visual past exam papers directly to students."
              : "Access beautiful, clear visual sheets of past exam papers curated directly of key schools of The Neotia University."}
          </p>
        </div>
      </section>

      {/* Interactive Main Body container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {isAdminMode ? (
          /* ================= ADMIN PORTAL MODE ================= */
          user && user.role === "admin" ? (
            <div id="tnu-admin-split-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in duration-300">
            
            {/* Upload form Panel */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
              
              <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2">
                  <UploadCloud className="h-5 w-5 text-amber-500" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">Publish Past Paper Pic</h2>
                </div>
                <button 
                  onClick={handleResetForm}
                  className="text-[10px] font-mono text-slate-400 hover:text-amber-500 underline transition cursor-pointer"
                >
                  Reset Form
                </button>
              </div>

              <form onSubmit={handlePaperSubmit} className="space-y-4">
                
                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Department / School</label>
                  <select 
                    value={formDeptName} 
                    onChange={(e) => setFormDeptName(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Marine Engineering">Marine Engineering</option>
                    <option value="School of Pharmacy">School of Pharmacy</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Robotics & Automation">Robotics & Automation</option>
                  </select>
                </div>

                {/* Grid for details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Subject Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Navigation II"
                      value={formSubjectName}
                      onChange={(e) => setFormSubjectName(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Course Code</label>
                    <input 
                      type="text"
                      placeholder="e.g. MRE101"
                      value={formSubjectCode}
                      onChange={(e) => setFormSubjectCode(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Semester</label>
                    <select 
                      value={formSemester}
                      onChange={(e) => setFormSemester(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 transition"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Year</label>
                    <select 
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 transition"
                    >
                      {["2026", "2025", "2024", "2023", "2022"].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Type</label>
                    <select 
                      value={formExamType}
                      onChange={(e) => setFormExamType(e.target.value as any)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 transition"
                    >
                      <option value="Final">End-Term</option>
                      <option value="Midterm">Mid-Term</option>
                    </select>
                  </div>
                </div>

                {/* Image upload widget */}
                <div className="border border-dashed border-slate-800 bg-slate-900/40 p-5 rounded-xl text-center relative hover:border-amber-500/50 transition">
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  
                  {uploadedBase64 ? (
                    <div className="space-y-3">
                      <div className="w-20 h-20 rounded-md bg-slate-950 border border-slate-800 mx-auto overflow-hidden flex items-center justify-center">
                        <img src={uploadedBase64} alt="Captured" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 font-bold block truncate max-w-xs mx-auto">
                        ✓ {imageFileName}
                      </div>
                      <p className="text-[10px] text-slate-500">Image loaded as Base64 DataURL</p>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedBase64("");
                          setImageFileName("");
                        }}
                        className="px-2.5 py-1 bg-red-950/40 border border-red-500/30 hover:bg-red-900/60 rounded text-[9px] font-bold text-red-400 cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-8 w-8 text-slate-600 mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-slate-300">Drag &amp; Drop or Upload Paper Photo</p>
                      <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP visual snapshots</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
                      >
                        Choose Picture File
                      </button>
                    </div>
                  )}
                </div>

                {/* DESIGNER WIDGET: A magical addition for quick visual evaluations without fumbling for image files on-device */}
                <div className="bg-slate-900/30 border border-amber-500/10 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-500">
                    <Sparkles className="h-4 w-4 animate-spin-slow" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider">TNU Digital Exam Designer</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Don't have a past paper photo on hand? Type the questions below, then click to auto-render a gorgeous, authentic printed exam booklet as fallback!
                  </p>
                  
                  <textarea 
                    rows={4}
                    value={questionTextarea}
                    onChange={(e) => setQuestionTextarea(e.target.value)}
                    placeholder="Enter exam questions (one per line)..."
                    className="w-full text-[11px] font-mono bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-amber-500"
                  />

                  <button
                    type="button"
                    onClick={handleGenerateExamSheet}
                    className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-lg text-xs font-extrabold transition"
                  >
                    ⚡ Render Digital Paper Sheet SVG
                  </button>
                </div>

                {/* Submits form */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Archiving Past Paper..." : "✓ Publish Into Student Vault"}
                </button>

              </form>

            </div>

            {/* Admin Live Moderation/Viewer right column */}
            <div className="lg:col-span-12 xl:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Library className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Live Library Records ({papers.length})</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">All Departments of TNU</span>
              </div>

              {papers.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                  <FileText className="h-8 w-8 text-slate-700 mx-auto" />
                  <p className="text-xs font-bold text-slate-400">No question papers archived yet.</p>
                  <p className="text-[10px] text-slate-500">Utilize the Registrar form on the left to start publishing papers.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {papers.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedPaper(p);
                        setZoomScale(1);
                      }}
                      className="group bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 hover:border-amber-500/40 transition flex items-start justify-between cursor-pointer relative"
                    >
                      <div className="space-y-1.5 max-w-[80%]">
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 uppercase tracking-wider">
                          {p.department.split(" ")[0] || "TNU"} &bull; Sem {p.semester}
                        </span>
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition truncate mt-1">
                          {p.subjectName}
                        </h4>
                        <p className="text-[10px] font-mono text-slate-400">Code: {p.subjectCode} | Year: {p.year}</p>
                        
                        <div className="flex items-center space-x-2 text-[10px]">
                          <span className="text-slate-500 italic block">
                            {p.picture ? "📷 Visual Snapshot included" : "📝 Questions Only"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeletePaper(p.id, e)}
                        className="p-1.5 bg-red-950/20 border border-red-500/20 text-red-500/80 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition"
                        title="Delete past paper"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
          ) : (
            /* Neotia Registry Authentication Panel Lock Box */
            <div id="tnu-admin-login-gate" className="max-w-md mx-auto bg-slate-950 border border-slate-850 rounded-2xl p-6.5 shadow-2xl relative overflow-hidden my-12 animate-in zoom-in-95 duration-200">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600"></div>
              
              <div className="text-center space-y-2 mb-6.5">
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-2">
                  <Lock className="h-5.5 w-5.5" />
                </div>
                <span className="block text-base font-black text-white uppercase tracking-wider font-mono">Registrar Credentials Shield</span>
                <p className="text-xs text-slate-400 font-medium">Please authenticate to access past question paper publisher parameters.</p>
              </div>

              <form onSubmit={handleAdminSignInSubmit} className="space-y-4.5">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Official email address</label>
                  <input 
                    type="email"
                    required
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    placeholder="registrar@neotia.edu.in"
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">Administrative password</label>
                  <div className="relative">
                    <input 
                      type="password"
                      required
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>



                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-sans text-xs font-black rounded-xl uppercase tracking-wider transition shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isAuthenticating ? (
                    <span>Verifying Lock...</span>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      <span>Unlock Registrar Panel</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )
        ) : (
          /* ================= PUBLIC STUDENT VIEWER MODE ================= */
          <div id="tnu-student-view-portal" className="space-y-8 animate-fade-in duration-300">
            
            {/* Search, filters, sort matrix bar */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Search query box */}
                <div className="lg:col-span-5 relative">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by subject code, exam term, syllabus keywords..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition text-slate-100"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-3.5 text-xs font-mono text-slate-500 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Semester selector */}
                <div className="lg:col-span-2 select-wrapper">
                  <select
                    value={selectedSem}
                    onChange={(e) => setSelectedSem(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 text-slate-200 font-medium"
                  >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                {/* Years selector */}
                <div className="lg:col-span-2 select-wrapper">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 text-slate-200 font-medium"
                  >
                    <option value="">All Assessment Years</option>
                    {["2026", "2025", "2024", "2023", "2022"].map(y => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>

                {/* Exam type selector */}
                <div className="lg:col-span-2 select-wrapper">
                  <select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 text-slate-200 font-medium"
                  >
                    <option value="">All Exam Terms</option>
                    <option value="Final">End-Term Exams</option>
                    <option value="Midterm">Mid-Term Exams</option>
                  </select>
                </div>

                {/* Clear triggers */}
                <div className="lg:col-span-1 justify-center flex items-center">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDept("All");
                      setSelectedSem("");
                      setSelectedYear("");
                      setSelectedExamType("");
                      addToast("Reset all search parameters", "info");
                    }}
                    className="w-full p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer"
                    title="Reset Filters"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="lg:hidden">Reset Filters</span>
                  </button>
                </div>

              </div>

              {/* Department Tabs selector pills */}
              <div className="border-t border-slate-800 pt-4 mt-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2.5">Key Academic Schools &amp; Departments</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedDept("All")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                          selectedDept === "All" 
                            ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/5" 
                            : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-slate-800/80"
                        }`}
                      >
                        All Schools ({papers.length})
                      </button>
                      {["Computer Science & Engineering", "Marine Engineering", "School of Pharmacy", "Business Administration", "Robotics & Automation"].map(dept => {
                        const count = papers.filter(p => p.department === dept).length;
                        return (
                          <button
                            key={dept}
                            onClick={() => setSelectedDept(dept)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                              selectedDept === dept 
                                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/5" 
                                : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-slate-800/80"
                            }`}
                          >
                            {dept} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bookmark Toggle Badge */}
                  <div className="shrink-0">
                    <button
                      onClick={() => {
                        setShowBookmarkedOnly(!showBookmarkedOnly);
                        addToast(showBookmarkedOnly ? "Showing all TNU documents" : "Filtering to your saved mock reference papers", "info");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border shrink-0 ${
                        showBookmarkedOnly 
                          ? "bg-amber-500 text-slate-950 border-transparent font-black shadow-lg shadow-amber-500/10" 
                          : "bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-800"
                      }`}
                    >
                      <Bookmark className={`h-3.5 w-3.5 shrink-0 ${showBookmarkedOnly ? "fill-slate-950 text-slate-950" : "text-amber-500"}`} />
                      <span>{showBookmarkedOnly ? "Saved Referentials (ON)" : "Filter Saved Books"}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Results Header with total counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpenCheck className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  Published Question Papers ({filteredPapersList.length})
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500">Sort by</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded p-1 text-slate-300 font-bold focus:outline-none focus:border-amber-500 text-[11px]"
                >
                  <option value="latest">Latest uploads</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>

            {/* Grid display for papers */}
            {filteredPapersList.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-slate-800 bg-slate-950 rounded-2xl space-y-3">
                <Library className="h-10 w-10 text-slate-700 mx-auto" />
                <h4 className="text-sm font-black text-slate-300 uppercase">No question sheets matched your filters</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting filters or switching to Admin Mode at the top right to upload or generate a visual past exam paper picture!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPapersList.map((p) => {
                  const paperPic = p.picture || generateFallbackPaperPic(p);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedPaper(p);
                        setZoomScale(1);
                        // Increment visual view locally
                        p.views = (p.views || 0) + 1;
                      }}
                      className="group bg-slate-950 border border-slate-850 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/[0.01] flex flex-col justify-between cursor-pointer"
                    >
                      {/* Document thumbnail visual block */}
                      <div className="relative h-44 bg-slate-900 flex items-center justify-center p-3 border-b border-slate-850 overflow-hidden">
                        <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition duration-350"></div>
                        
                        {/* Mini printed sheet paper container inside the card */}
                        <div className="w-[110px] h-[146px] shadow-lg group-hover:scale-110 transition duration-350 overflow-hidden rounded bg-slate-50 border border-slate-200">
                          <img 
                            src={paperPic} 
                            alt={p.subjectName} 
                            className="w-full h-full object-cover pointer-events-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Centered glassmorphism magnification zoom badge */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-250 bg-slate-950/45">
                          <span className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider flex items-center space-x-1.5 shadow-lg">
                            <ZoomIn className="h-3.5 w-3.5" />
                            <span>View Paper Sheet</span>
                          </span>
                        </div>

                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-bold py-0.5 px-2 rounded bg-amber-500 text-slate-950 font-mono tracking-wider uppercase border border-amber-400/10">
                            {p.examType === 'Midterm' ? 'Mid-Term' : 'End-Term'}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5 z-10">
                          <button
                            onClick={(e) => handleToggleBookmark(p.id, e)}
                            className="p-1 px-1.5 bg-slate-950/80 hover:bg-slate-950 text-amber-400 rounded-lg border border-slate-800/60 backdrop-blur-sm transition pointer-events-auto"
                            title={savedBookmarks.includes(p.id) ? "Remove bookmark" : "Add to Study Bookmarks"}
                          >
                            <Bookmark className={`h-3.5 w-3.5 shrink-0 ${savedBookmarks.includes(p.id) ? "fill-amber-500 text-amber-500" : "text-amber-500"}`} />
                          </button>
                        </div>
                      </div>

                      {/* Info & labels block */}
                      <div className="p-4.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-mono tracking-widest text-slate-500 font-bold uppercase truncate">
                            {p.department}
                          </p>
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition leading-tight line-clamp-2">
                            {p.subjectName}
                          </h4>
                          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                            <span className="font-mono bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded text-[10px] text-amber-500">{p.subjectCode}</span>
                            <span className="text-slate-600">&bull;</span>
                            <span>Semester {p.semester}</span>
                          </div>
                        </div>

                        {/* Stats indicator */}
                        <div className="flex items-center justify-between mt-4 border-t border-slate-850 pt-3">
                          <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-slate-600" />
                              <span>{p.year} Exam</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-slate-600" />
                              <span>{p.views || 0} reviews</span>
                            </span>
                          </div>
                          
                          <div className="text-[10px] font-mono font-bold text-amber-500 flex items-center space-x-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
                            <span>Inspect</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ================= VISUAL PREVIEW OVERLAY / SCREEN SHEET MODAL ================= */}
      {selectedPaper && (
        <div id="tnu-paper-viewer-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Visual sheet section (Left/Middle block depending on layout) */}
            <div className="md:w-3/5 bg-slate-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative select-none">
              
              <div className="flex items-center justify-between mb-4 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">Exam Booklet Preview</span>
                
                {/* Scale buttons */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.2))}
                    className="p-1 px-2.5 bg-slate-800 hover:bg-slate-705 text-white rounded text-[11px] font-bold"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-amber-500 font-bold select-none">{Math.round(zoomScale * 100)}%</span>
                  <button 
                    onClick={() => setZoomScale(prev => Math.min(1.8, prev + 0.2))}
                    className="p-1 px-2.5 bg-slate-800 hover:bg-slate-705 text-white rounded text-[11px] font-bold"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Scrolling visual paper box */}
              <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-slate-950/50 rounded-xl border border-slate-800/40 relative max-h-[52vh]">
                <div 
                  className="transition-transform duration-200 origin-top shadow-inner shadow-slate-950 bg-slate-50 border border-slate-200 rounded"
                  style={{ transform: `scale(${zoomScale})`, width: "100%", maxWidth: "460px" }}
                >
                  <img 
                    src={selectedPaper.picture || generateFallbackPaperPic(selectedPaper)} 
                    alt={selectedPaper.subjectName}
                    className="w-full h-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Action widgets */}
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={handlePrintPaper}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800/80 text-slate-300 font-mono rounded text-[11px] font-bold border border-slate-800 transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-400" />
                  <span>Print Document</span>
                </button>
                <a
                  href={selectedPaper.picture || generateFallbackPaperPic(selectedPaper)}
                  download={`${selectedPaper.subjectCode}_TNU_${selectedPaper.year}.png`}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded text-[11px] font-bold font-sans transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-slate-950" />
                  <span>Download Image</span>
                </a>
              </div>

            </div>

            {/* Questions Transcript, Metadata & School guidelines (Right column) */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto bg-slate-900 max-h-[90vh]">
              
              <div className="space-y-5">
                
                {/* Header label with close button */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold py-0.5 px-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono tracking-widest uppercase">
                      Official Archive
                    </span>
                    <h3 className="text-base font-black text-white mt-1.5 leading-tight">{selectedPaper.title}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedPaper(null)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Information List */}
                <div className="bg-slate-950/40 rounded-xl p-4.5 border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">School School</span>
                    <span className="font-bold text-slate-200">{selectedPaper.department}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Course Course</span>
                    <span className="font-bold text-slate-200">{selectedPaper.subjectName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Course Code</span>
                    <span className="font-bold text-slate-200 mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{selectedPaper.subjectCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Academic Year</span>
                    <span className="font-bold text-slate-200">{selectedPaper.year} Assessment</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Active Term</span>
                    <span className="font-bold text-amber-500">{selectedPaper.examType === 'Midterm' ? 'Mid-Term Exam' : 'Semester Final'}</span>
                  {/* Interactive Study Workstation Tabs */}
                <div className="flex border-b border-slate-800 pb-1 gap-2">
                  <button
                    onClick={() => setModalActiveTab('questions')}
                    className={`flex-1 pb-2 text-xs font-bold transition text-center ${
                      modalActiveTab === 'questions' ? "border-b-2 border-amber-500 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => setModalActiveTab('ai-buddy')}
                    className={`flex-1 pb-2 text-xs font-bold transition text-center flex items-center justify-center space-x-1 ${
                      modalActiveTab === 'ai-buddy' ? "border-b-2 border-amber-500 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Bot className="h-3.5 w-3.5 text-amber-500" />
                    <span className="hidden sm:inline">AI Tutor</span>
                  </button>
                  <button
                    onClick={() => setModalActiveTab('predictor')}
                    className={`flex-1 pb-2 text-xs font-bold transition text-center flex items-center justify-center space-x-1 ${
                      modalActiveTab === 'predictor' ? "border-b-2 border-amber-500 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    <span className="hidden sm:inline">AI Predicts</span>
                  </button>
                  <button
                    onClick={() => setModalActiveTab('discussion')}
                    className={`flex-1 pb-2 text-xs font-bold transition text-center flex items-center justify-center space-x-1 ${
                      modalActiveTab === 'discussion' ? "border-b-2 border-amber-500 text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Discussions</span>
                  </button>
                </div>

                {/* Tab content 1: Copyable Syllabus Questions */}
                {modalActiveTab === 'questions' && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">SYLLABUS DOCUMENT TRANSCRIPT</h4>
                      <button
                        onClick={handleCopyQuestions}
                        className="text-[10px] font-mono text-amber-500 hover:text-amber-400 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{isCopied ? "Copied!" : "Copy Sheet Text"}</span>
                      </button>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl block max-h-56 overflow-y-auto space-y-2.5">
                      {selectedPaper.questions && selectedPaper.questions.length > 0 ? (
                        selectedPaper.questions.map((q, idx) => (
                          <div key={idx} className="flex space-x-2 items-start text-xs border-b border-slate-900 pb-2.5 last:border-0 last:pb-0">
                            <span className="font-mono font-bold text-amber-500">#{idx+1}</span>
                            <span className="text-slate-300 leading-normal font-sans">{q}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-500 italic text-center">No digital transcript entered.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab content 2: AI prep bot */}
                {modalActiveTab === 'ai-buddy' && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase flex items-center space-x-1">
                        <Bot className="h-3.5 w-3.5 text-amber-500" />
                        <span>Neotia Prep-GPT AI Companion</span>
                      </h4>
                      <span className="text-[8px] font-mono font-extrabold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10">ONLINE</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl overflow-y-auto space-y-2.5 h-[178px] max-h-[178px]">
                      {aiChatMessages.map((msg, index) => (
                        <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <div className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[90%] ${
                            msg.sender === 'user' 
                              ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none' 
                              : 'bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {aiChatLoading && (
                        <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono animate-pulse">
                          <Cpu className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                          <span>Gemini is generating answers...</span>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSendAiMessage} className="flex space-x-1.5 pt-1">
                      <input 
                        type="text"
                        value={aiChatInput}
                        onChange={(e) => setAiChatInput(e.target.value)}
                        placeholder="e.g. Help guide me on solving group A..."
                        required
                        className="flex-1 text-xs bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={aiChatLoading}
                        className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                )}

                {/* Tab content 3: AI trends predictor advice */}
                {modalActiveTab === 'predictor' && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase flex items-center space-x-1">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>Gemini Exam Trends &amp; Recommendations</span>
                      </h4>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">TNU ARCHIVES AI</span>
                    </div>

                    {predictedTips.length > 0 ? (
                      <div className="space-y-2 bg-slate-950 border border-slate-850 p-3 rounded-xl max-h-56 overflow-y-auto">
                        {predictedTips.map((tip, idx) => (
                          <div key={idx} className="flex space-x-2.5 items-start text-xs border-b border-slate-900 pb-2.5 last:border-0 last:pb-0">
                            <span className="p-1 rounded bg-amber-500/10 text-amber-500 text-[10px] font-mono font-bold shrink-0">TIP #{idx+1}</span>
                            <span className="text-slate-300 leading-normal font-medium">{tip}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl text-center space-y-2.5">
                        <Cpu className="h-8 w-8 text-slate-700 mx-auto" />
                        <h5 className="text-xs font-bold text-slate-300 uppercase">Run Past Paper Deep Analysis</h5>
                        <p className="text-[10px] text-slate-500 leading-normal max-w-xs mx-auto">
                          Our server utilizes Gemini LLM to scan booklet transcripts, historical patterns, and cross-reference syllabus likelihood.
                        </p>
                        <button
                          type="button"
                          onClick={handleLoadPredictions}
                          disabled={predictedLoading}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition shadow shadow-amber-500/10 disabled:opacity-50"
                        >
                          {predictedLoading ? "Generating Predictions..." : "⚡ Run Gemini Recommendation Tips"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content 4: Classroom peer solutions discussions */}
                {modalActiveTab === 'discussion' && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase flex items-center space-x-1">
                        <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                        <span>Classroom Q&amp;A &amp; Solutions Board</span>
                      </h4>
                      <span className="text-[9px] font-mono text-slate-500">{commentsList.length} post{commentsList.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl overflow-y-auto space-y-2.5 h-[178px] max-h-[178px]">
                      {isCommentsLoading ? (
                        <div className="text-center py-6 text-xs text-slate-500 font-mono animate-pulse">Loading discussion streams...</div>
                      ) : commentsList.length === 0 ? (
                        <div className="text-center py-6 space-y-1">
                          <p className="text-[11px] text-slate-500 italic">No notes or solutions posted here yet.</p>
                          <p className="text-[9px] text-slate-600">Be first to ask a question or leave solutions advice!</p>
                        </div>
                      ) : (
                        commentsList.map((com) => (
                          <div key={com.id} className="border-b border-smart-900 border-slate-900 pb-2.5 last:border-0 last:pb-0 space-y-1 text-xs">
                            <div className="flex justify-between text-[9px] font-mono text-slate-500">
                              <span className="font-bold text-amber-400">{com.userName || "Student Scholar"}</span>
                              <span>{new Date(com.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-300 leading-normal font-sans">{com.comment}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleAddComment} className="flex space-x-1.5 pt-1">
                      <input 
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Type answer walkthrough or peer notes..."
                        required
                        className="flex-1 text-xs bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={commentIsSubmitting}
                        className="px-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg cursor-pointer transition disabled:opacity-50"
                      >
                        {commentIsSubmitting ? "Post" : "Submit"}
                      </button>
                    </form>
                  </div>
                )}                  </div>
                </div>

              </div>

              {/* Bottom university disclaimer */}
              <div className="border-t border-slate-800 pt-5 mt-6 text-center">
                <p className="text-[10px] text-slate-500 leading-normal">
                  All archival resources are intended exclusively for academic study reference at The Neotia University (TNU). Downloading and distribution for commercial intent are strictly prohibited.
                </p>
                <p className="text-[8px] font-mono text-slate-600 mt-1">ESTABLISHED UNDER WEST BENGAL ACT XXIII OF 2014</p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="tnu-global-footer" className="bg-slate-950 border-t border-slate-800 py-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-400">The Neotia University Question Archival Repository System</p>
          <p className="max-w-lg mx-auto leading-normal text-[11px]">
            Established under Section 2(f) of UGC Act, 1956. This platform is curated by registrar, school deans, and students of TNU to share paper visuals securely.
          </p>
          <p className="pt-4 font-mono text-[10px] text-slate-600">&copy; 2026 The Neotia University &bull; All Rights Private</p>
        </div>
      </footer>

    </div>
  );
}
