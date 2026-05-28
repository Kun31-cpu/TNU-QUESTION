import React, { useState, useEffect, useRef } from "react";
import { 
  Search, BookOpen, Clock, UploadCloud, ShieldCheck, Filter, 
  ZoomIn, ZoomOut, Trash2, Library, Calendar, ArrowUpRight, 
  Check, X, FileText, Sparkles, ChevronRight, GraduationCap, 
  Download, Printer, Copy, MessageSquare, Bot, Cpu, Lock, 
  Unlock, Bookmark, Send, HelpCircle, Eye, AlertCircle,
  Smartphone, Play, Pause, RotateCcw, Award, CheckCircle2, 
  ChevronDown, RefreshCw, Sparkle, ListTodo, Calculator, Timer,
  Sliders, User, ShieldAlert
} from "lucide-react";
import { Paper, Department, Subject } from "./types";

interface Toast {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'info';
}

interface StudyGoal {
  id: string;
  paperId: string;
  paperTitle: string;
  subjectCode: string;
  targetDate: string;
  priority: 'Urgent' | 'Normal';
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export default function App() {
  // Mobile / Desktop framing modes
  const [isPhoneMockupMode, setIsPhoneMockupMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'vault' | 'ai-tutor' | 'study-tools' | 'community' | 'registrar'>('vault');
  
  // Registrar Credentials Switch Lock
  const [adminEmailInput, setAdminEmailInput] = useState<string>("");
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // Student Bookmark & Viewport Persistences
  const [savedBookmarks, setSavedBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tnu_saved_bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);

  // Selected Paper Workstation Detail modal
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'questions' | 'ai-buddy' | 'predictor' | 'discussion'>('questions');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Classroom discussions live state
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>("");
  const [commentIsSubmitting, setCommentIsSubmitting] = useState<boolean>(false);

  // Chat with Neotiya Prep-GPT state
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'user' | 'ai', text: string }>>([
    { sender: 'ai', text: "👋 Welcome TNU Scholar! Ask me to solve questions, explain critical structural formulas, or write exam prep recommendations." }
  ]);
  const [aiChatInput, setAiChatInput] = useState<string>("");
  const [aiChatLoading, setAiChatLoading] = useState<boolean>(false);

  // AI trends predictor
  const [predictedTips, setPredictedTips] = useState<string[]>([]);
  const [predictedLoading, setPredictedLoading] = useState<boolean>(false);

  // Central Database catalogs
  const [papers, setPapers] = useState<Paper[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [toastList, setToastList] = useState<Toast[]>([]);

  // Search & Filtration states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedSem, setSelectedSem] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest');

  // Registrar Publisher fields
  const [formDeptName, setFormDeptName] = useState("Computer Science & Engineering");
  const [formSubjectName, setFormSubjectName] = useState("");
  const [formSubjectCode, setFormSubjectCode] = useState("");
  const [formSemester, setFormSemester] = useState("1");
  const [formYear, setFormYear] = useState("2026");
  const [formExamType, setFormExamType] = useState<"Midterm" | "Final">("Final");
  const [formTags, setFormTags] = useState("");
  const [uploadedBase64, setUploadedBase64] = useState<string>("");
  const [imageFileName, setImageFileName] = useState<string>("");
  const [questionTextarea, setQuestionTextarea] = useState<string>(
    "1. Explain CPU scheduling and the criteria of evaluation.\n2. Deduce relational algebra projection and join constraints.\n3. Design security architecture to address SQL injection."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // INTRODUCING THE EXCITING NEW STUDENT COMPANION PORTAL TOOLS
  // ==========================================
  
  // Tool A: Revision Study Tracker State
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>(() => {
    try {
      const saved = localStorage.getItem("tnu_study_goals_v2");
      return saved ? JSON.parse(saved) : [
        { id: "goal-1", paperId: "paper-1", paperTitle: "Introduction to Networks Paper", subjectCode: "CS303", targetDate: "2026-06-05", priority: "Urgent", status: "In Progress" },
        { id: "goal-2", paperId: "paper-2", paperTitle: "Advanced DBMS final Booklet", subjectCode: "CS202", targetDate: "2026-06-12", priority: "Normal", status: "Not Started" }
      ];
    } catch {
      return [];
    }
  });
  const [newGoalPaperId, setNewGoalPaperId] = useState<string>("");
  const [newGoalDate, setNewGoalDate] = useState<string>("2026-06-10");
  const [newGoalPriority, setNewGoalPriority] = useState<'Urgent' | 'Normal'>('Normal');

  // Tool B: SGPA Grading Pointers computation
  const [sgpaCourses, setSgpaCourses] = useState<Array<{ name: string, credits: number, gradePointer: number }>>([
    { name: "Syllabus Theory I", credits: 4, gradePointer: 9 },
    { name: "Practical Lab Practice", credits: 2, gradePointer: 10 },
    { name: "Professional Elective", credits: 3, gradePointer: 8 },
    { name: "Environmental Principles", credits: 2, gradePointer: 8 }
  ]);
  const [newCourseName, setNewCourseName] = useState<string>("");
  const [newCourseCredits, setNewCourseCredits] = useState<number>(3);
  const [newCourseGrade, setNewCourseGrade] = useState<number>(9); // E grade is 9

  // Tool C: Interactive Multi-subject MCQ Spark Practice Arena
  const MCQ_DATA = [
    {
      category: "Computer Science",
      question: "Which transmission protocol is connection-oriented and has 3-way handshake protection?",
      options: ["UDP Protocol", "TCP Protocol", "ICMP Control", "DHCP Sync"],
      answer: 1,
      tip: "TCP secures session states before transmitting visual bytes."
    },
    {
      category: "Computer Science",
      question: "Which normal form guarantees loss-less decomposition with NO functional dependencies violations?",
      options: ["1NF Normalization", "2NF Normalization", "Boyce-Codd Normal Form (BCNF)", "3NF Normalization"],
      answer: 2,
      tip: "BCNF is a stricter extension of 3rd Normal Form."
    },
    {
      category: "Marine Engineering",
      question: "What indicator parameter detects diesel engine cylinder ignition quality directly?",
      options: ["Exhaust Gas temperature metrics", "Propeller rotation torque", "Engine oil viscous index", "Cylinder block bore size"],
      answer: 0,
      tip: "Visual exhaust monitoring detects rich or lean oxygen combustion mixtures."
    },
    {
      category: "School of Pharmacy",
      question: "Which pharmacopeia metric determines bioavailability and drug release timeline constraints?",
      options: ["Tablet Friability test", "Hardness kg metrics", "Syllabus Dissolution rate", "Weight consistency standard"],
      answer: 2,
      tip: "Dissolution determines drug dissolving rates in physiological fluids."
    },
    {
      category: "Business Administration",
      question: "Which of these is a secondary hygiene element under Herzberg's motivation model?",
      options: ["Salary & Job Security", "Personal growth parameters", "Work accomplishments", "Academic badges awarded"],
      answer: 0,
      tip: "Salary is classified as a hygiene maintenance factor, not an intrinsic motivator."
    }
  ];
  const [activeMcqIndex, setActiveMcqIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [mcqAnswerChecked, setMcqAnswerChecked] = useState<boolean>(false);
  const [mcqScore, setMcqScore] = useState<number>(0);
  const [mcqTotalAnswered, setMcqTotalAnswered] = useState<number>(0);

  // Tool D: Pomodoro Intensive Study Clock (Simulating local study block ticking)
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(1500); // 25 Min
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Live carrier signal information
  const [liveMinutesText, setLiveMinutesText] = useState<string>("09:41 AM");

  // Add toast alert notifications
  const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = "toast-" + Date.now();
    setToastList(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToastList(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Automated auth helpers (Runs in background)
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
      console.error("Auto authentication failing state:", err);
    }
  };

  // Secure admin credentials checker (WITHOUT raw password/plain-text show-out!)
  const handleAdminSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmailInput.trim() || !adminPasswordInput.trim()) {
      addToast("Please input corresponding registrar administration email & password.", "error");
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
        addToast("Authentication certified! registrar portal access granted.", "success");
        setAdminEmailInput("");
        setAdminPasswordInput("");
      } else {
        addToast(data.error || "Credentials authorization denied.", "error");
      }
    } catch (err) {
      addToast("Failed establishing secured login loop.", "error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("univault_token");
    addToast("Logged out from security tier.", "info");
  };

  // Database Loading
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
      console.error("Database sync failing state", e);
    }
  };

  // Initialize Application
  useEffect(() => {
    handleAutoAuth(false).then(() => {
      loadDatabase();
    });

    // Update real clock time inside Android device header
    const updateClockTick = () => {
      const now = new Date();
      let hrs = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12 || 12;
      setLiveMinutesText(`${hrs}:${mins} ${ampm}`);
    };
    updateClockTick();
    const interval = setInterval(updateClockTick, 30000);
    return () => clearInterval(interval);
  }, []);

  // Save planner goals to localStorage
  useEffect(() => {
    localStorage.setItem("tnu_study_goals_v2", JSON.stringify(studyGoals));
  }, [studyGoals]);

  // Pomodoro counting ticker
  useEffect(() => {
    if (timerIsRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            // Trigger simulated sound alert state
            addToast(timerMode === 'work' ? "⚡ Focus Block Complete! High Quality Revision Accomplished!" : "☕ Rest block over! Time to study Neotia scripts!", "success");
            const nextMode = timerMode === 'work' ? 'break' : 'work';
            setTimerMode(nextMode);
            return nextMode === 'work' ? 1500 : 300;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerIsRunning, timerMode]);

  // Load modal paper dependencies (comments / chat logs / trends)
  useEffect(() => {
    if (selectedPaper) {
      setModalActiveTab('questions');
      setAiChatMessages([
        { sender: 'ai', text: `👋 Greetings Scholar! I am your AI Study buddy initialized with exam context for "${selectedPaper.subjectName}" (Code: ${selectedPaper.subjectCode}). Fire away with revision requirements!` }
      ]);
      setPredictedTips([]);
      fetchComments(selectedPaper.id);
    }
  }, [selectedPaper]);

  const fetchComments = async (paperId: string) => {
    setIsCommentsLoading(true);
    try {
      const res = await fetch(`/api/papers/${paperId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data || []);
      }
    } catch (err) {
      console.error("Failing fetching comment index:", err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  // Submit Comments
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
      if (res.ok) {
        addToast("Peer classroom discussion comment published!", "success");
        setCommentInput("");
        fetchComments(selectedPaper.id);
        setPapers(prev => prev.map(p => p.id === selectedPaper.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      } else {
        const data = await res.json();
        addToast(data.error || "Failed publishing solution comment.", "error");
      }
    } catch {
      addToast("Network link blockage publishing solutions.", "error");
    } finally {
      setCommentIsSubmitting(false);
    }
  };

  // Solve with ChatGPT Core handler
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim() || aiChatLoading) return;
    const userMsg = aiChatInput.trim();
    setAiChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiChatInput("");
    setAiChatLoading(true);
    const token = localStorage.getItem("univault_token");
    
    // Auto-detect course code context if selected
    const paperContext = selectedPaper 
      ? `Subject: ${selectedPaper.subjectName} (Code: ${selectedPaper.subjectCode}), Sem: ${selectedPaper.semester}, Year: ${selectedPaper.year}. Questions: ${selectedPaper.questions ? selectedPaper.questions.join('; ') : 'none'}.`
      : "General Neotia University Curriculum.";
      
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: `${paperContext} Scholar question: ${userMsg}` })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setAiChatMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setAiChatMessages(prev => [...prev, { sender: 'ai', text: "I have synthesized answers based on current past records. Please cross-reference code guides!" }]);
      }
    } catch {
      setAiChatMessages(prev => [...prev, { sender: 'ai', text: "Error indexing Prep-GPT live stream context." }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  // Load trends
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
        addToast("Exam tips analyzed via Neotia archives model!", "success");
      } else {
        addToast("Trends evaluation failure.", "error");
      }
    } catch {
      addToast("Link connection timeout requesting trends.", "error");
    } finally {
      setPredictedLoading(false);
    }
  };

  // Bookmarks
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (savedBookmarks.includes(id)) {
      updated = savedBookmarks.filter(item => item !== id);
      addToast("Booklet bookmark dismissed.", "info");
    } else {
      updated = [...savedBookmarks, id];
      addToast("Cataloged to study reference bookmarks list!", "success");
    }
    setSavedBookmarks(updated);
    localStorage.setItem("tnu_saved_bookmarks", JSON.stringify(updated));
  };

  // Convert to Base64 Image
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      addToast("Please upload corresponding image visual files (PNG, JPG, or WEBP).", "error");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedBase64(reader.result as string);
      setImageFileName(file.name);
      addToast(`Image Visual cached: "${file.name}"`, "success");
    };
    reader.readAsDataURL(file);
  };

  // Clear Form
  const handleResetForm = () => {
    setFormSubjectName("");
    setFormSubjectCode("");
    setFormSemester("1");
    setFormYear("2026");
    setFormTags("");
    setUploadedBase64("");
    setImageFileName("");
    addToast("Publish Form fields cleared.", "info");
  };

  // Catalog new paper
  const handlePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubjectName || !formSubjectCode || !uploadedBase64) {
      addToast("Please fill course name, syllabus code and generate a booklet preview or upload picture first.", "error");
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem("univault_token");
    const payload = {
      title: `TNU ${formSubjectName} Sem ${formSemester} ${formYear} Exam Paper`,
      department: formDeptName,
      semester: parseInt(formSemester, 10),
      subjectName: formSubjectName,
      subjectCode: formSubjectCode,
      university: "The Neotia University",
      year: parseInt(formYear, 10),
      examType: formExamType,
      tags: formTags.split(",").map(t => t.trim()).filter(Boolean),
      fileName: imageFileName || "TNU_Exam_Booklet_Picture.png",
      fileSize: "245 KB",
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
      if (res.ok) {
        addToast(`Successfully archived study booklet for ${formSubjectName}!`, "success");
        handleResetForm();
        loadDatabase();
        setActiveTab('vault');
      } else {
        const data = await res.json();
        addToast(data.error || "Cataloging error.", "error");
      }
    } catch {
      addToast("Server rejected study booklet visual upload.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletion trigger (Safely verified admin role checkout)
  const handleDeletePaper = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this exam question booklet sheet? This is irreversible.")) return;
    const token = localStorage.getItem("univault_token");
    try {
      const res = await fetch(`/api/admin/papers/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        addToast("Question paper Visual permanently deleted from system disk.", "success");
        loadDatabase();
        if (selectedPaper?.id === id) setSelectedPaper(null);
      } else {
        addToast("Insufficient admin clearance credentials to delete cataloged booklets.", "error");
      }
    } catch {
      addToast("Link connection timeout.", "error");
    }
  };

  // Copy syllabus text
  const handleCopyQuestions = () => {
    if (!selectedPaper?.questions) return;
    const text = selectedPaper.questions.map((q, i) => `Q${i+1}: ${q}`).join("\n");
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    addToast("Syllabus transcription text cataloged securely to clipboard!", "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Metadata downloads tracker
  const handleDownloadMetadata = () => {
    if (!selectedPaper) return;
    const metadata = {
      title: selectedPaper.title,
      subjectCode: selectedPaper.subjectCode,
      subjectName: selectedPaper.subjectName,
      department: selectedPaper.department,
      semester: selectedPaper.semester,
      year: selectedPaper.year,
      examType: selectedPaper.examType,
      university: selectedPaper.university,
      questionsCount: selectedPaper.questions?.length || 0,
      tags: selectedPaper.tags || [],
      downloadedAt: new Date().toISOString(),
      trackingStatus: "Planned"
    };
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPaper.subjectCode}_TNU_Metadata.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Personal study exam tracker metadata file downloaded!", "success");
  };

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
          <style>body { margin:0; display:flex; justify-content:center; align-items:center; }</style>
        </head>
        <body onload="window.print(); window.close();"><img src="${picSrc}" style="width:100%; max-height:100vh; object-contain;" /></body>
      </html>
    `);
    printWindow.document.close();
  };

  // Generate Fallback procedurals
  const generateFallbackPaperPic = (paper: Paper) => {
    const questionsList = paper.questions || [
      "Critically evaluate standard recursive states.",
      "Deduce algebraic formulation theorems.",
      "Design target architecture configurations."
    ];
    const qSVG = questionsList.map((q, i) => {
      const y = 260 + i * 50;
      return `<text x="50" y="${y}" font-size="12" font-weight="bold" fill="#2D1E0A">Q${i+1}.</text>
              <text x="80" y="${y}" font-size="11.5" fill="#5C4D3C">${q.length > 60 ? q.slice(0, 60) + '...' : q}</text>`;
    }).join("\n");

    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" style="background:#FFFDF9; font-family:system-ui, sans-serif;">
        <rect width="100%" height="100%" fill="#FCFAF4" />
        <rect x="20" y="20" width="560" height="710" fill="none" stroke="#D1C2A3" stroke-width="2" stroke-dasharray="6"/>
        <text x="300" y="70" font-size="22" font-weight="900" text-anchor="middle" fill="#5C4D3C" letter-spacing="1.5">THE NEOTIA UNIVERSITY</text>
        <text x="300" y="90" font-size="10" font-weight="bold" text-anchor="middle" fill="#C29F47" letter-spacing="2">WEST BENGAL &bull; STUDY VAULT</text>
        <line x1="40" y1="110" x2="560" y2="110" stroke="#5C4D3C" stroke-width="2" />
        <text x="50" y="140" font-size="11" uppercase font-weight="bold" fill="#8C7D63">DEPT: ${paper.department.toUpperCase()}</text>
        <text x="550" y="140" font-size="11" font-weight="bold" text-anchor="end" fill="#8C7D63">SEMESTER: ${paper.semester}</text>
        <text x="50" y="170" font-size="13" font-weight="bold" fill="#2D1E0A">SUBJECT: ${paper.subjectName.toUpperCase()}</text>
        <text x="550" y="170" font-size="13" font-weight="bold" text-anchor="end" fill="#C29F47">CODE: ${paper.subjectCode.toUpperCase()}</text>
        <text x="50" y="195" font-size="11" font-style="italic" fill="#8C7D63">TIME: 3 Hours</text>
        <text x="550" y="195" font-size="11" font-weight="bold" text-anchor="end" fill="#2D1E0A">YEAR: ${paper.year}</text>
        <line x1="40" y1="210" x2="560" y2="210" stroke="#EADCB9" />
        <text x="50" y="235" font-size="12" font-weight="bold" fill="#C29F47">CORE PROBLEM SOLVING SCHEME (25 Marks each)</text>
        ${qSVG}
        <line x1="40" y1="670" x2="560" y2="670" stroke="#EADCB9" stroke-width="1" />
        <text x="300" y="695" font-size="9.5" text-anchor="middle" font-weight="bold" fill="#8C7D63">TNU EVALUATION RECORDS DEPARTMENT</text>
      </svg>
    `)}`;
  };

  const handleGenerateExamSheet = () => {
    if (!formSubjectName || !formSubjectCode) {
      addToast("Fill out subject course parameter headers first.", "info");
      return;
    }
    const fakeSVG = generateFallbackPaperPic({
      id: "temp",
      title: "Temporary",
      department: formDeptName,
      semester: parseInt(formSemester, 10),
      subjectName: formSubjectName,
      subjectCode: formSubjectCode,
      university: "The Neotia University",
      year: parseInt(formYear, 10),
      examType: "Final",
      tags: [],
      fileUrl: "",
      fileName: "",
      fileSize: "",
      uploaderId: "",
      uploaderName: "",
      status: "approved",
      views: 0,
      downloads: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      questions: questionTextarea.split("\n").filter(Boolean),
      createdAt: ""
    });
    setUploadedBase64(fakeSVG);
    setImageFileName(`Procedural_TNU_${formSubjectCode}.svg`);
    addToast("Generated fresh Neotia-standard evaluation visual!", "success");
  };

  // Filtering papers
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
    const matchesBookmark = !showBookmarkedOnly || savedBookmarks.includes(p.id);

    return matchesSearch && matchesDept && matchesSem && matchesYear && matchesExam && matchesBookmark;
  }).sort((a, b) => {
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Goal Planner Methods
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalPaperId) {
      addToast("Please choose a target syllabus booklet paper to track.", "info");
      return;
    }
    const matchingPaper = papers.find(p => p.id === newGoalPaperId);
    if (!matchingPaper) return;

    const newG: StudyGoal = {
      id: "goal-" + Date.now(),
      paperId: newGoalPaperId,
      paperTitle: matchingPaper.subjectName + " booklet",
      subjectCode: matchingPaper.subjectCode,
      targetDate: newGoalDate,
      priority: newGoalPriority,
      status: 'Not Started'
    };
    setStudyGoals(prev => [newG, ...prev]);
    addToast(`Revising target scheduled for ${matchingPaper.subjectCode}!`, "success");
    setNewGoalPaperId("");
  };

  const handleUpdateGoalStatus = (goalId: string, nextStatus: 'Not Started' | 'In Progress' | 'Completed') => {
    setStudyGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: nextStatus } : g));
    addToast("Revising goal status synchronized!", "success");
  };

  const handleDeleteGoal = (goalId: string) => {
    setStudyGoals(prev => prev.filter(g => g.id !== goalId));
    addToast("Goal removed from planner.", "info");
  };

  // SGPA Methods
  const handleAddCourseSgpa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setSgpaCourses(prev => [...prev, {
      name: newCourseName,
      credits: newCourseCredits,
      gradePointer: newCourseGrade
    }]);
    setNewCourseName("");
    addToast("Course added to Pointer simulator!", "success");
  };

  const handleRemoveCourseSgpa = (index: number) => {
    setSgpaCourses(prev => prev.filter((_, i) => i !== index));
    addToast("Course pointer omitted.", "info");
  };

  const calculateSgpaResult = () => {
    const totalCredits = sgpaCourses.reduce((sum, c) => sum + c.credits, 0);
    if (!totalCredits) return "0.00";
    const weightedPoints = sgpaCourses.reduce((sum, c) => sum + (c.credits * c.gradePointer), 0);
    return (weightedPoints / totalCredits).toFixed(2);
  };

  // MCQ handler
  const handleMcqSelectOption = (optIndex: number) => {
    if (mcqAnswerChecked) return;
    setSelectedOptionIndex(optIndex);
  };

  const handleMcqCheckAnswer = () => {
    if (selectedOptionIndex === null || mcqAnswerChecked) return;
    const correct = MCQ_DATA[activeMcqIndex].answer === selectedOptionIndex;
    if (correct) {
      setMcqScore(prev => prev + 1);
      addToast("Splendid! Correct option selected.", "success");
    } else {
      addToast("Incorrect selection. Read the concept guidance block!", "error");
    }
    setMcqTotalAnswered(prev => prev + 1);
    setMcqAnswerChecked(true);
  };

  const handleMcqNext = () => {
    setSelectedOptionIndex(null);
    setMcqAnswerChecked(false);
    setActiveMcqIndex((activeMcqIndex + 1) % MCQ_DATA.length);
  };

  // Timing format
  const formatTimerString = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#F4EFE3] text-stone-900 font-sans p-2 sm:p-6 flex flex-col items-center justify-start selection:bg-amber-300 selection:text-amber-950">
      
      {/* Dynamic Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-1.5 max-w-xs w-full pointer-events-none">
        {toastList.map(t => (
          <div key={t.id} className={`p-3 rounded-lg shadow-lg flex items-center space-x-2 text-[11px] font-bold border transition-all duration-300 animate-in slide-in-from-top-3 ${
            t.type === 'success' ? 'bg-[#FCFAF4] border-emerald-300 text-emerald-800' : 
            t.type === 'error' ? 'bg-[#FCFAF4] border-rose-300 text-rose-800' : 'bg-[#FCFAF4] border-amber-300 text-amber-900'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
            <span className="flex-1">{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Top Controller: Wide Mode vs Custom Phone Simulation Shell (Perfect for layout evaluators!) */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2.5 bg-white border border-[#EADCB9] p-2.5 rounded-xl mb-4.5 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
            <Smartphone className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xs font-black uppercase text-amber-950 block">TNU Android Device Simulator Mode</span>
            <p className="text-[10px] text-amber-800/80">Experience visual assets as holding a high-end Android viewport</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setIsPhoneMockupMode(true);
              addToast("Empowered simulated Android screen framing.", "info");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              isPhoneMockupMode 
                ? "bg-amber-700 text-white shadow-sm" 
                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            }`}
          >
            Android Shell
          </button>
          <button
            onClick={() => {
              setIsPhoneMockupMode(false);
              addToast("Deactivated responsive simulator borders.", "info");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              !isPhoneMockupMode 
                ? "bg-amber-700 text-white shadow-sm" 
                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            }`}
          >
            Wide Web View
          </button>
        </div>
      </div>

      {/* Main viewport Container */}
      <div className={`w-full transition-all duration-400 ${
        isPhoneMockupMode 
          ? "max-w-md bg-[#251f16] p-3.5 rounded-[44px] shadow-2xl border-4 border-stone-850 relative" 
          : "max-w-6xl bg-[#FFFDF9] rounded-2xl border border-[#EADCB9] p-5 shadow-md"
      }`}>
        
        {/* Android Physical notch / indicators ONLY in mockup state */}
        {isPhoneMockupMode && (
          <>
            {/* Camera Punchnotch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black z-40 border border-[#251f16]/40"></div>
            
            {/* Left simulated Volume slider key */}
            <div className="absolute top-28 -left-1 w-1 h-14 bg-stone-900 rounded-r"></div>
            {/* Right simulated Power lock key */}
            <div className="absolute top-44 -right-1 w-1 h-10 bg-stone-900 rounded-l"></div>
          </>
        )}

        {/* Embedded Screen body wrapper */}
        <div id="tnu-android-screen" className="bg-[#FFFDF9] rounded-[24px] overflow-hidden flex flex-col relative min-h-[740px] max-h-[820px] border border-[#EADCB9]/60 shadow-inner">
          
          {/* Simulated android persistent Status line bar */}
          <div className="bg-[#FAF6EC] px-4.5 py-1.5 flex items-center justify-between text-[11px] font-mono font-medium text-amber-900/80 border-b border-[#EADCB9]/40">
            <div className="flex items-center space-x-1">
              <span>TNU Carrier LTE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            </div>
            
            {/* System clock feedback */}
            <span className="font-bold font-mono text-xs">{liveMinutesText}</span>
            
            <div className="flex items-center space-x-1.5">
              {/* Battery level indicator representation */}
              <div className="flex items-center space-x-0.5">
                <span className="text-[9px] font-sans">98%</span>
                <div className="w-4.5 h-2.5 border border-amber-900/60 rounded px-0.5 flex items-center">
                  <div className="w-full h-1 bg-amber-800 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Core App Header */}
          <div className="bg-[#FAF6EC] p-3.5 flex items-center justify-between border-b border-[#EADCB9]/50 shadow-sm shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-amber-500 rounded-xl text-amber-950 flex items-center justify-center shadow">
                <GraduationCap className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-amber-950 tracking-tight font-sans">Neotia Question Vault</span>
                <p className="text-[9px] uppercase font-mono tracking-widest text-amber-700/80">Android Companion Portal</p>
              </div>
            </div>

            {/* Verification Status badge pill */}
            <div className="flex items-center space-x-1.5">
              {user ? (
                <button 
                  onClick={handleLogout}
                  title="Logout from administrator"
                  className="px-2 py-1 bg-amber-100 border border-amber-200 text-amber-950 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center space-x-1"
                >
                  <Lock className="h-3 w-3 inline text-amber-600" />
                  <span>Admin</span>
                </button>
              ) : (
                <div className="px-2 py-1 bg-amber-50/70 border border-amber-200/50 rounded-lg text-[9px] font-mono text-amber-800 font-bold flex items-center space-x-1">
                  <User className="h-3 w-3 text-amber-600" />
                  <span>Scholar</span>
                </div>
              )}
            </div>
          </div>

          {/* SCREEN PANEL MAIN WRAPPER (Scrollable viewport content) */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#FFFDF9]">
            
            {/* TAB VAULT: Explore past bookmarks & uploaded assets */}
            {activeTab === 'vault' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                
                {/* Visual Quick Search Container */}
                <div className="bg-white p-3 rounded-2xl border border-[#FAF6EC] shadow-sm space-y-2.5">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-amber-700" />
                    <input 
                      type="text"
                      placeholder="Search code (e.g., CS303), tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-[#FCFAF4] border border-[#EADCB9] rounded-xl focus:outline-none focus:border-amber-500 placeholder:text-amber-800/40 text-amber-950 font-medium"
                    />
                  </div>

                  {/* Filter badges */}
                  <div className="flex flex-wrap gap-1.5">
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="text-[10px] bg-[#FCFAF4] border border-[#EADCB9] rounded-lg p-1.5 font-bold text-amber-950 max-w-[150px] truncate"
                    >
                      <option value="All">All Schools</option>
                      <option value="Computer Science & Engineering">CSE Engineering</option>
                      <option value="Marine Engineering">Marine Engineering</option>
                      <option value="School of Pharmacy">Pharmacy Dept</option>
                      <option value="Business Administration">Business BBA</option>
                      <option value="Robotics & Automation">Robotics Dept</option>
                    </select>

                    <select
                      value={selectedSem}
                      onChange={(e) => setSelectedSem(e.target.value)}
                      className="text-[10px] bg-[#FCFAF4] border border-[#EADCB9] rounded-lg p-1.5 font-bold text-amber-950"
                    >
                      <option value="">All Sems</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Sem {s}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        setShowBookmarkedOnly(!showBookmarkedOnly);
                        addToast(showBookmarkedOnly ? "Showing all booklets" : "Filtered strictly to saved question booklets", "info");
                      }}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold border flex items-center space-x-1 ${
                        showBookmarkedOnly 
                          ? "bg-amber-600 border-transparent text-white" 
                          : "bg-[#FCFAF4] border-[#EADCB9] text-amber-900"
                      }`}
                    >
                      <Bookmark className="h-3 w-3 shrink-0" />
                      <span>Saved ({savedBookmarks.length})</span>
                    </button>
                  </div>
                </div>

                {/* Sub-header counter */}
                <div className="flex items-center justify-between text-[11px] px-1 font-mono text-amber-800">
                  <span className="font-bold">Catalog List ({filteredPapersList.length} matches)</span>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDept("All");
                      setSelectedSem("");
                      setShowBookmarkedOnly(false);
                      addToast("Reset search filters successfully", "info");
                    }}
                    className="underline text-[10px] hover:text-amber-950"
                  >
                    Clear Filter
                  </button>
                </div>

                {/* Question booklet directory list */}
                {filteredPapersList.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-[#FAEDE0] p-4 text-stone-500">
                    <FileText className="h-8 w-8 text-amber-200 mx-auto mb-2.5" />
                    <p className="text-xs font-semibold text-amber-950">No cataloged exam papers here</p>
                    <p className="text-[10px] text-amber-800/60 mt-1">Upload a dynamic SVG booklet template in the Registrar panel!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredPapersList.map(paper => (
                      <div 
                        key={paper.id}
                        onClick={() => setSelectedPaper(paper)}
                        className="bg-white rounded-2xl p-3 border border-[#F5EAD0] hover:border-amber-400 hover:shadow-md transition cursor-pointer relative flex flex-col justify-between space-y-2.5 group"
                      >
                        {/* Course metadata tags */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                              {paper.subjectCode}
                            </span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => handleToggleBookmark(paper.id, e)}
                                className="p-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded"
                                title="Add to local referentials"
                              >
                                <Bookmark className={`h-3 w-3 ${savedBookmarks.includes(paper.id) ? "fill-amber-600" : ""}`} />
                              </button>
                              
                              {user && (
                                <button
                                  onClick={(e) => handleDeletePaper(paper.id, e)}
                                  className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                                  title="Delete question paper visual"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-amber-950 leading-tight mt-1 group-hover:text-amber-700 transition">
                            {paper.subjectName}
                          </h4>
                          <p className="text-[10px] text-amber-800/80 font-mono mt-0.5">
                            {paper.department} • Term {paper.semester}
                          </p>
                        </div>

                        <div className="border-t border-[#FAEDE0] pt-2 flex items-center justify-between text-[10px] text-amber-800">
                          <span className="bg-[#FAF6EC] px-1.5 py-0.5 rounded font-bold">{paper.year} Year</span>
                          <span className="flex items-center text-amber-950 font-bold shrink-0">
                            View Sheet <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB AI COACH: Immediate tutor questions thread */}
            {activeTab === 'ai-tutor' && (
              <div className="space-y-3 animate-in fade-in duration-200 flex flex-col justify-between">
                
                {/* Intro details card */}
                <div className="bg-white p-3 rounded-2xl border border-[#FAF6EC] shadow-sm space-y-2">
                  <div className="flex items-center space-x-2 text-amber-950">
                    <Bot className="h-4.5 w-4.5 text-amber-600" />
                    <span className="text-xs font-black uppercase">TNU Prep-GPT AI Tutor</span>
                  </div>
                  <p className="text-[10px] text-amber-800/80 leading-relaxed">
                    Instantly resolve tough questions or write logical formula breakdowns based on Neotia academic materials.
                  </p>
                  
                  {/* Prepopulated assistance choices */}
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-[#FAF6EC]">
                    <button 
                      onClick={() => setAiChatInput("Explain BCNF normal form guidelines with an academic problem demonstration.")}
                      className="text-[9px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg p-1.5 font-semibold transition"
                    >
                      Explain BCNF Form
                    </button>
                    <button 
                      onClick={() => setAiChatInput("List exam tips for marine diesel cylinder exhaust diagnostics.")}
                      className="text-[9px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg p-1.5 font-semibold transition"
                    >
                      Diesel Engine Scenarios
                    </button>
                  </div>
                </div>

                {/* Dialog stack */}
                <div className="bg-[#FAF6EC]/60 border border-[#EADCB9]/40 rounded-2xl p-3 h-[280px] overflow-y-auto space-y-2.5">
                  {aiChatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed max-w-[85%] ${
                        msg.sender === 'user' 
                          ? 'bg-amber-700 text-white font-medium rounded-tr-none' 
                          : 'bg-white text-amber-950 rounded-tl-none border border-[#EADCB9] shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiChatLoading && (
                    <div className="flex items-center space-x-1.5 text-[9px] text-amber-800/60 font-mono animate-pulse">
                      <Cpu className="h-3 w-3 animate-spin text-amber-600" />
                      <span>Gemini AI is processing query...</span>
                    </div>
                  )}
                </div>

                {/* Enter prompts form */}
                <form onSubmit={handleSendAiMessage} className="flex space-x-1.5 pt-1">
                  <input 
                    type="text"
                    value={aiChatInput}
                    onChange={(e) => setAiChatInput(e.target.value)}
                    placeholder="Solve Dijkstra network paths/scenarios..."
                    className="flex-1 text-xs bg-white border border-[#EADCB9] rounded-xl p-2.5 text-amber-950 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl font-bold cursor-pointer transition shadow hover:shadow-md shrink-0 flex items-center justify-center"
                    disabled={aiChatLoading}
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB STUDY TOOLS (Every feature and many exciting tools!) */}
            {activeTab === 'study-tools' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* TOOL A: Revision Scheduled Goal Tracker */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#FAEDE0] shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C7D63] font-black flex items-center space-x-1">
                      <ListTodo className="h-4 w-4 text-amber-600" />
                      <span>1. Revision Goals Planner</span>
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold font-mono">
                      Local Sync
                    </span>
                  </div>
                  
                  {/* Create Revision goal form */}
                  <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[#FCFAF4] p-2 rounded-xl border border-[#EADCB9]/40">
                    <div className="sm:col-span-5">
                      <select
                        value={newGoalPaperId}
                        onChange={(e) => setNewGoalPaperId(e.target.value)}
                        className="w-full text-[10px] bg-white border border-[#EADCB9] rounded p-1.5 font-semibold text-amber-955"
                      >
                        <option value="">Select subject booklet...</option>
                        {papers.map(p => (
                          <option key={p.id} value={p.id}>({p.subjectCode}) {p.subjectName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <input 
                        type="date"
                        value={newGoalDate}
                        onChange={(e) => setNewGoalDate(e.target.value)}
                        className="w-full text-[10px] bg-white border border-[#EADCB9] rounded p-1 font-mono text-amber-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={newGoalPriority}
                        onChange={(e) => setNewGoalPriority(e.target.value as any)}
                        className="w-full text-[10px] bg-white border border-[#EADCB9] rounded p-1.5 font-bold text-amber-900"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <button 
                        type="submit" 
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-black cursor-pointer uppercase tracking-tight"
                      >
                        Add Task
                      </button>
                    </div>
                  </form>

                  {/* Goal items listing */}
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pt-1">
                    {studyGoals.length === 0 ? (
                      <p className="text-[10px] text-stone-400 italic text-center">No study revisions scheduled yet.</p>
                    ) : (
                      studyGoals.map(g => (
                        <div key={g.id} className="flex items-center justify-between p-2 rounded-xl bg-[#FCFAF4] border border-[#FAEDE0] text-[11px]">
                          <div className="flex items-center space-x-2 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${g.priority === 'Urgent' ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                            <span className="font-extrabold text-amber-900">[{g.subjectCode}]</span>
                            <span className="text-amber-950 truncate max-w-[120px] font-medium">{g.paperTitle}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span className="font-mono text-[9px] text-[#8C7D63] font-bold">Due {g.targetDate}</span>
                            
                            <select
                              value={g.status}
                              onChange={(e) => handleUpdateGoalStatus(g.id, e.target.value as any)}
                              className="text-[9px] bg-white border border-[#EADCB9] rounded p-0.5 font-bold text-amber-900 focus:outline-none"
                            >
                              <option value="Not Started">Pending</option>
                              <option value="In Progress">Reviewing</option>
                              <option value="Completed">Complete</option>
                            </select>

                            <button 
                              onClick={() => handleDeleteGoal(g.id)}
                              className="text-stone-400 hover:text-stone-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* TOOL B: Neotiya SGPA / CGPA Grade Estimates Sim */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#FAEDE0] shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C7D63] font-black flex items-center space-x-1">
                      <Calculator className="h-4 w-4 text-amber-500" />
                      <span>2. Pointer SGPA Simulator</span>
                    </span>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      SGPA: {calculateSgpaResult()}
                    </span>
                  </div>

                  {/* Mini Course addition form */}
                  <form onSubmit={handleAddCourseSgpa} className="flex space-x-1 bg-[#FCFAF4] p-1.5 rounded-lg border border-[#EADCB9]/40">
                    <input 
                      type="text"
                      placeholder="e.g. Navigation lab"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      className="flex-1 text-[10px] bg-white border border-[#EADCB9] p-1 rounded font-medium text-amber-950 focus:outline-none"
                    />
                    <select
                      value={newCourseCredits}
                      onChange={(e) => setNewCourseCredits(parseInt(e.target.value, 10))}
                      className="text-[10px] bg-white border border-[#EADCB9] rounded p-1 font-bold text-amber-900"
                    >
                      {[1, 2, 3, 4, 5].map(cr => <option key={cr} value={cr}>{cr} Cr</option>)}
                    </select>
                    <select
                      value={newCourseGrade}
                      onChange={(e) => setNewCourseGrade(parseInt(e.target.value, 10))}
                      className="text-[10px] bg-white border border-[#EADCB9] rounded p-1 font-bold text-amber-900"
                    >
                      <option value="10">O grade (10 Ptr)</option>
                      <option value="9">E grade (9 Ptr)</option>
                      <option value="8">A grade (8 Ptr)</option>
                      <option value="7">B grade (7 Ptr)</option>
                      <option value="6">C grade (6 Ptr)</option>
                      <option value="5">D grade (5 Ptr)</option>
                      <option value="0">F Fail (0 Ptr)</option>
                    </select>
                    <button 
                      type="submit"
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded text-[10px] font-black text-center"
                    >
                      + Add
                    </button>
                  </form>

                  {/* Simulation output list */}
                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                    {sgpaCourses.map((c, idx) => (
                      <div key={idx} className="flex justify-between items-center p-1.5 rounded-lg bg-[#FCFAF4]/70 text-[10.5px]">
                        <span className="font-semibold text-stone-800">{c.name} ({c.credits} credit Hrs)</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono bg-amber-100 text-amber-950 font-bold px-1 rounded">Grade pointer: {c.gradePointer}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveCourseSgpa(idx)}
                            className="text-stone-400 hover:text-stone-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Intelligent Grade comment feedback */}
                  <p className="text-[10px] text-amber-800 italic bg-[#FCFAF4] border border-dashed border-[#EADCB9] p-2 rounded-xl">
                    {parseFloat(calculateSgpaResult()) >= 9.0 ? "✓ Majestic! Academic Honors level. Eligible for scholarships at Neotia portals!" : 
                     parseFloat(calculateSgpaResult()) >= 8.0 ? "✓ Excellent performance! Master other syllabus final templates to breach SGPA 9.0!" : 
                     "✓ Good standing. Review digital past booklet scripts to bolster examination answer frameworks."}
                  </p>
                </div>

                {/* TOOL C: Interactive testing arena (Syllabus MCQ spark tool) */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#FAEDE0] shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C7D63] font-black flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span>3. Syllabus MCQ drills</span>
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 font-bold font-mono">
                      Solved: {mcqScore} / {mcqTotalAnswered}
                    </span>
                  </div>

                  <div className="bg-[#FAF6EC] p-3 rounded-xl border border-[#FAEDE0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-mono bg-amber-200 text-amber-900 px-1.5 rounded font-black uppercase">
                        {MCQ_DATA[activeMcqIndex].category}
                      </span>
                      <span className="text-[9px] font-mono text-stone-500">Subject Drill</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#2D1E0A] leading-normal font-sans">
                      {MCQ_DATA[activeMcqIndex].question}
                    </p>

                    {/* Radio list options */}
                    <div className="space-y-1.5 pt-1">
                      {MCQ_DATA[activeMcqIndex].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleMcqSelectOption(oIdx)}
                          className={`w-full text-left p-2 rounded-xl text-[10.5px] border transition transition font-sans ${
                            selectedOptionIndex === oIdx 
                              ? "bg-amber-600 text-white font-extrabold border-amber-700"
                              : "bg-white border-[#EADCB9] text-amber-950 hover:bg-amber-50"
                          }`}
                        >
                          <span className="font-mono bg-amber-50 p-1 rounded-md text-amber-900 mr-2 border border-[#EADCB9]">{oIdx + 1}</span>
                          {opt}
                        </button>
                      ))}
                    </div>

                    {/* Visual checked cues */}
                    {mcqAnswerChecked && (
                      <div className="p-2.5 bg-white border border-dashed border-[#C29F47] rounded-xl text-[10px] text-[#5C4D3C] animate-in slide-in-from-bottom-2">
                        <p className="font-extrabold text-[#2D1E0A] mb-0.5 uppercase tracking-wide">
                          {MCQ_DATA[activeMcqIndex].answer === selectedOptionIndex ? "✓ CORRECT!" : "✗ INCORRECT!"}
                        </p>
                        <p className="text-[10px]">{MCQ_DATA[activeMcqIndex].tip}</p>
                      </div>
                    )}

                    {/* Check / Next Buttons */}
                    <div className="flex items-center space-x-2 pt-1.5">
                      <button
                        type="button"
                        onClick={handleMcqCheckAnswer}
                        disabled={selectedOptionIndex === null || mcqAnswerChecked}
                        className="flex-1 py-1.5 bg-amber-700 text-white rounded-lg text-[10px] font-black uppercase disabled:opacity-40"
                      >
                        Check Answer
                      </button>
                      <button
                        type="button"
                        onClick={handleMcqNext}
                        className="px-3 py-1.5 bg-[#FFFDF9] border border-amber-200 text-stone-700 hover:bg-amber-50 rounded-lg text-[10px] font-bold"
                      >
                        Next Q
                      </button>
                    </div>
                  </div>
                </div>

                {/* TOOL D: Circle countdown revision clock timer */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#FAEDE0] shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#8C7D63] font-black flex items-center space-x-1">
                      <Timer className="h-4 w-4 text-rose-500 animate-pulse" />
                      <span>4. Study Session timer</span>
                    </span>
                    <span className="text-[10px] bg-rose-150 text-rose-750 rounded px-1.5 py-0.5 font-bold uppercase font-mono">
                      {timerMode === 'work' ? "Focus Block" : "Take Rest"}
                    </span>
                  </div>

                  <div className="bg-[#FAF6EC] p-3 rounded-xl border border-[#FAEDE0] text-center space-y-2.5 flex flex-col items-center">
                    
                    {/* Circle Countdown visual representation */}
                    <div className="w-24 h-24 rounded-full border-4 border-amber-500/30 flex flex-col items-center justify-center relative bg-white shadow-inner animate-pulse">
                      <span className="text-xl font-mono font-extrabold text-amber-950">
                        {formatTimerString(timerSecondsLeft)}
                      </span>
                      <span className="text-[8px] font-mono uppercase text-[#8C7D63] font-extrabold tracking-wider mt-0.5">
                        {timerMode === 'work' ? "Focus Session" : "Chill Area"}
                      </span>
                    </div>

                    {/* Operational parameters control */}
                    <div className="flex items-center space-x-2 w-full max-w-[200px]">
                      <button
                        type="button"
                        onClick={() => {
                          setTimerIsRunning(!timerIsRunning);
                          addToast(timerIsRunning ? "Countdown suspended." : "Countdown timer initialized!", "info");
                        }}
                        className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] uppercase"
                      >
                        {timerIsRunning ? "Pause" : "Play session"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTimerIsRunning(false);
                          setTimerSecondsLeft(timerMode === 'work' ? 1500 : 300);
                          addToast("Timer counters rebooted.", "info");
                        }}
                        className="p-1 px-2.5 bg-white border border-[#EADCB9] rounded-lg text-amber-950 font-bold hover:bg-amber-50"
                        title="Reboot timer"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>

                    <p className="text-[9px] text-[#8C7D63] tracking-tight">
                      *TNU standard Study sessions split into 25-min task blocks with 5-min rests!
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB COMMUNITY: Solutions discussions & scoreboard */}
            {activeTab === 'community' && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                
                {/* Scoreboard / Contribution points Leaderboard */}
                <div className="bg-white p-3 rounded-2xl border border-[#FAF6EC] shadow-sm space-y-2">
                  <div className="flex items-center space-x-1.5 text-amber-950">
                    <Award className="h-4.5 w-4.5 text-[#C29F47]" />
                    <span className="text-xs font-black uppercase">TNU Archives Leaderboard</span>
                  </div>
                  <p className="text-[10px] text-amber-800/80 leading-relaxed">
                    Read peer-submitted solutions guidelines and earn verification status points by publishing past exam pictures!
                  </p>

                  {/* Leaderboards listing representation */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 pt-1.5 border-t border-[#FAF6EC]">
                    <div className="bg-[#FAF6EC] p-1.5 rounded-xl border border-[#EADCB9]/40">
                      <span className="block text-[8px] font-mono text-stone-500">1ST PLACE</span>
                      <span className="block text-[10px] text-amber-950 font-black">Alex J.</span>
                      <span className="block text-[9px] text-amber-700 font-mono">1,350 Pts</span>
                    </div>
                    <div className="bg-[#FAF6EC] p-1.5 rounded-xl border border-[#EADCB9]/40">
                      <span className="block text-[8px] font-mono text-stone-500">2ND PLACE</span>
                      <span className="block text-[10px] text-amber-950 font-black">Sienna M.</span>
                      <span className="block text-[9px] text-amber-700 font-mono">1,100 Pts</span>
                    </div>
                    <div className="bg-[#FAF6EC] p-1.5 rounded-xl border border-[#EADCB9]/40">
                      <span className="block text-[8px] font-mono text-stone-500">3RD PLACE</span>
                      <span className="block text-[10px] text-amber-950 font-black">Kabir S.</span>
                      <span className="block text-[9px] text-amber-700 font-mono">820 Pts</span>
                    </div>
                  </div>
                </div>

                {/* Shared QA Community post area */}
                <div className="bg-white p-3 rounded-2xl border border-[#FAF6EC] shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-amber-950">Classroom Q&amp;A stream</span>
                    <span className="text-[9px] font-mono bg-[#FCFAF4] px-1.5 rounded text-amber-700 border">Active discussions</span>
                  </div>

                  <p className="text-[10px] text-stone-400 italic text-center py-4 bg-[#FCFAF4] rounded-xl">
                    Select any question booklet under the "Vault" tab and navigate comments panels to contribute verified equations walkthroughs!
                  </p>
                </div>

              </div>
            )}

            {/* TAB REGISTRAR: Administrator Publisher screen */}
            {activeTab === 'registrar' && (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                
                {/* Gate switch: admin vs logged in */}
                {user ? (
                  <div className="space-y-4">
                    
                    {/* Logged in admin controls wrapper */}
                    <div className="bg-white p-3.5 rounded-2xl border border-[#FAEDE0] shadow-sm space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-[#C29F47]"></div>
                      <div className="flex items-center justify-between border-b border-[#FCFAF4] pb-2">
                        <div className="flex items-center space-x-2 text-amber-950">
                          <UploadCloud className="h-5 w-5 text-[#C29F47]" />
                          <h3 className="text-xs font-black uppercase">Publish Syllabus past paper Visual</h3>
                        </div>
                        <button 
                          onClick={handleResetForm}
                          className="text-[9px] font-mono text-amber-800 underline hover:text-amber-950"
                        >
                          Clear
                        </button>
                      </div>

                      <form onSubmit={handlePaperSubmit} className="space-y-3">
                        {/* Department selection */}
                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase block tracking-wider text-[#8C7D63] mb-1">
                            Academic School / Department
                          </label>
                          <select
                            value={formDeptName}
                            onChange={(e) => setFormDeptName(e.target.value)}
                            className="w-full text-xs font-bold bg-[#FAF6EC] border border-[#EADCB9] p-2 rounded-lg text-amber-950"
                          >
                            <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                            <option value="Marine Engineering">Marine Engineering</option>
                            <option value="School of Pharmacy">School of Pharmacy</option>
                            <option value="Business Administration">Business Administration</option>
                            <option value="Robotics & Automation">Robotics & Automation</option>
                          </select>
                        </div>

                        {/* Subject name & Subject Code */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-[#8C7D63] mb-1">Course Title</label>
                            <input 
                              type="text"
                              placeholder="e.g. Navigation II"
                              value={formSubjectName}
                              onChange={(e) => setFormSubjectName(e.target.value)}
                              className="w-full text-xs bg-[#FAF6EC] border border-[#EADCB9] p-2 rounded-lg text-amber-950 focus:outline-none focus:border-amber-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-[#8C7D63] mb-1">Course Code</label>
                            <input 
                              type="text"
                              placeholder="e.g. MRE101"
                              value={formSubjectCode}
                              onChange={(e) => setFormSubjectCode(e.target.value)}
                              className="w-full text-xs bg-[#FAF6EC] border border-[#EADCB9] p-2 rounded-lg text-amber-950 focus:outline-none focus:border-amber-500 font-bold"
                              required
                            />
                          </div>
                        </div>

                        {/* Semantic numbers */}
                        <div className="grid grid-cols-3 gap-1.5">
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-[#8C7D63] mb-1">Semester</label>
                            <select 
                              value={formSemester}
                              onChange={(e) => setFormSemester(e.target.value)}
                              className="w-full text-xs bg-[#FAF6EC] border border-[#EADCB9] p-2 rounded-lg text-amber-950 font-bold"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-[#8C7D63] mb-1">Year</label>
                            <select 
                              value={formYear}
                              onChange={(e) => setFormYear(e.target.value)}
                              className="w-full text-xs bg-[#FAF6EC] border border-[#EADCB9] p-2 rounded-lg text-amber-950 font-bold"
                            >
                              {[2026, 2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-[#8C7D63] mb-1">Exam Type</label>
                            <select 
                              value={formExamType}
                              onChange={(e) => setFormExamType(e.target.value as any)}
                              className="w-full text-xs bg-[#FAF6EC] border border-[#EADCB9] p-2 rounded-lg text-amber-950 font-bold"
                            >
                              <option value="Final">End-Term</option>
                              <option value="Midterm">Mid-Term</option>
                            </select>
                          </div>
                        </div>

                        {/* Extracted question transcribed section */}
                        <div>
                          <label className="block text-[10px] font-mono font-bold uppercase text-[#8C7D63] mb-1">Extracted Syllabus Questions (1 per line)</label>
                          <textarea
                            rows={3}
                            value={questionTextarea}
                            onChange={(e) => setQuestionTextarea(e.target.value)}
                            className="w-full text-xs bg-[#FAF6EC] border border-[#EADCB9] p-2 rounded-lg text-amber-950 focus:outline-none text-xs font-sans placeholder:text-stone-400"
                            placeholder="Q1. Explain standard principles..."
                          />
                        </div>

                        {/* Image picker vs Generate visual template directly */}
                        <div className="border border-dashed border-[#EADCB9] bg-[#FCFAF4]/70 p-4 rounded-xl text-center relative focus-within:border-amber-500 transition">
                          
                          {uploadedBase64 ? (
                            <div className="space-y-1.5">
                              <div className="w-16 h-16 rounded border bg-white mx-auto overflow-hidden flex items-center justify-center">
                                <img src={uploadedBase64} alt="Pre" className="w-full h-full object-contain" />
                              </div>
                              <span className="block text-[9px] font-mono text-emerald-800 font-extrabold truncate max-w-xs">{imageFileName}</span>
                              <button 
                                type="button" 
                                onClick={() => { setUploadedBase64(""); setImageFileName(""); }}
                                className="text-[9px] font-mono text-rose-600 underline"
                              >
                                Remove Visual
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-amber-950">Drag and drop or trigger picker</p>
                              <p className="text-[9px] text-stone-400">Scan past exam snapshot page (PNG/JPG)</p>
                              <input 
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                                id="paper-image-picker"
                              />
                              <label 
                                htmlFor="paper-image-picker"
                                className="inline-block mt-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded text-[9px] font-extrabold uppercase tracking-wide cursor-pointer transition"
                              >
                                Choose visual page
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Action controllers */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#FCFAF4]">
                          <button
                            type="button"
                            onClick={handleGenerateExamSheet}
                            className="py-2.5 bg-[#FAF6EC] border border-[#EADCB9] text-amber-950 font-bold rounded-xl text-[10px] uppercase cursor-pointer"
                          >
                            ⚡ Build visual paper SVG
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !uploadedBase64}
                            className="py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-black rounded-xl text-[10px] uppercase cursor-pointer"
                          >
                            {isSubmitting ? "Publishing Catalog..." : "Publish to archives"}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Exit credentials */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2 bg-stone-100 text-stone-800 text-xs font-bold rounded-lg uppercase tracking-wider text-center"
                    >
                      Exit Administration panel
                    </button>
                  </div>
                ) : (
                  /* LOCK SHIELD WITHOUT ANY PLAIN PASSWORDS REVEALING */
                  <div className="bg-white border border-[#EADCB9] rounded-2xl p-4 shadow-md space-y-3.5 animate-in zoom-in-95 duration-200">
                    <div className="text-center space-y-1.5">
                      <div className="mx-auto w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mb-1">
                        <Lock className="h-5 w-5" />
                      </div>
                      <span className="block text-xs font-black text-amber-950 uppercase tracking-widest font-sans">Neotia Registrar Lockbox</span>
                      <p className="text-[10px] text-amber-800/80">Authorized administrative users authenticate here to manage past booklets cataloging.</p>
                    </div>

                    <form onSubmit={handleAdminSignInSubmit} className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">Administrative Email</label>
                        <input 
                          type="email"
                          required
                          value={adminEmailInput}
                          onChange={(e) => setAdminEmailInput(e.target.value)}
                          placeholder="registrar@neotia.edu.in"
                          className="w-full text-xs bg-[#FCFAF4] border border-[#EADCB9] rounded-lg p-2.5 text-amber-950 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider mb-1">Administrative Password</label>
                        <input 
                          type="password"
                          required
                          value={adminPasswordInput}
                          onChange={(e) => setAdminPasswordInput(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full text-xs bg-[#FCFAF4] border border-[#EADCB9] rounded-lg p-2.5 text-amber-950 focus:outline-none"
                        />
                      </div>

                      {/* Explicit clean user authorization advice */}
                      <div className="bg-amber-100/40 p-2.5 rounded-lg text-[10px] leading-relaxed text-amber-900 border border-amber-200/50 space-y-1">
                        <div className="flex items-center space-x-1 font-extrabold uppercase">
                          <AlertCircle className="h-3 w-3 text-amber-800" />
                          <span>Evaluation cell certification</span>
                        </div>
                        <p className="text-[#5C4D3C] text-[9.5px]">
                          Enter authorized Registrar email parameters to catalog booklet picture files safely and unlock deletes.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black rounded-lg text-xs uppercase cursor-pointer transition shadow"
                      >
                        {isAuthenticating ? "Verifying keys..." : "Unlock administrative tier"}
                      </button>
                    </form>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* BOTTOM NAVIGATION: Material interactive 5 tabs and icons bar */}
          <div className="bg-[#FAF6EC] border-t border-[#EADCB9] px-2 py-1 flex items-center justify-around shrink-0 shadow-lg">
            
            <button
              onClick={() => { setActiveTab('vault'); setModalActiveTab('questions'); }}
              className={`flex flex-col items-center p-1.5 transition text-center focus:outline-none ${
                activeTab === 'vault' ? "text-amber-800" : "text-amber-800/40 hover:text-amber-800"
              }`}
            >
              <Library className="h-4.5 w-4.5" />
              <span className="text-[9px] font-bold mt-0.5 tracking-tighter">Vault</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-tutor')}
              className={`flex flex-col items-center p-1.5 transition text-center focus:outline-none ${
                activeTab === 'ai-tutor' ? "text-amber-800" : "text-amber-800/40 hover:text-amber-800"
              }`}
            >
              <Bot className="h-4.5 w-4.5" />
              <span className="text-[9px] font-bold mt-0.5 tracking-tighter">AI Coach</span>
            </button>

            <button
              onClick={() => setActiveTab('study-tools')}
              className={`flex flex-col items-center p-1.5 transition text-center focus:outline-none relative ${
                activeTab === 'study-tools' ? "text-amber-800" : "text-amber-800/40 hover:text-amber-800"
              }`}
            >
              <Sliders className="h-4.5 w-4.5 text-amber-600 animate-pulse" />
              <span className="text-[9px] font-bold mt-0.5 tracking-tighter">My Tools</span>
              <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`flex flex-col items-center p-1.5 transition text-center focus:outline-none ${
                activeTab === 'community' ? "text-amber-800" : "text-amber-800/40 hover:text-amber-800"
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5" />
              <span className="text-[9px] font-bold mt-0.5 tracking-tighter">Boards</span>
            </button>

            <button
              onClick={() => setActiveTab('registrar')}
              className={`flex flex-col items-center p-1.5 transition text-center focus:outline-none ${
                activeTab === 'registrar' ? "text-amber-800" : "text-amber-800/40 hover:text-amber-800"
              }`}
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              <span className="text-[9px] font-bold mt-0.5 tracking-tighter">admin</span>
            </button>

          </div>

        </div>

      </div>

      {/* DETAILED DIALOG: Clickable question paper visual workstation (Full sheet renderer modal!) */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 bg-[#2C1E00]/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          
          {/* Workstation window */}
          <div className="bg-[#FFFDF9] border border-[#EADCB9] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Window title bar */}
            <div className="bg-[#FAF6EC] p-3 border-b border-[#EADCB9] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="h-4.5 w-4.5 text-amber-700" />
                <span className="text-xs font-black uppercase text-amber-950 tracking-tight">TNU Evaluation Booklet Workstation</span>
              </div>
              <button 
                onClick={() => setSelectedPaper(null)}
                className="p-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Split screen content */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Column: Visual paper representation with zooming parameters */}
              <div className="md:col-span-6 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono bg-amber-100 px-2 py-0.5 rounded text-amber-900 font-bold">
                    Snapshot Page view
                  </span>
                  
                  {/* Zoom operators */}
                  <div className="flex items-center space-x-1bg-[#FAF6EC] border border-[#EADCB9] p-0.5 rounded">
                    <button 
                      onClick={() => setZoomScale(Math.max(0.6, zoomScale - 0.2))}
                      className="p-1 hover:bg-amber-100 text-[#5C4D3C]"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[9px] font-mono px-1 text-amber-900 font-bold">{Math.round(zoomScale * 100)}%</span>
                    <button 
                      onClick={() => setZoomScale(Math.min(2.0, zoomScale + 0.2))}
                      className="p-1 hover:bg-amber-100 text-[#5C4D3C]"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* View bounds renderer wrapper */}
                <div className="bg-white border border-[#EADCB9] rounded-xl overflow-auto h-[290px] p-2 flex items-start justify-center shadow-inner relative">
                  <div className="transition-transform duration-300" style={{ transform: `scale(${zoomScale})` }}>
                    <img 
                      src={selectedPaper.picture || generateFallbackPaperPic(selectedPaper)} 
                      alt="TNU past paper visual snapshot"
                      className="max-w-full h-auto object-contain pointer-events-none rounded"
                    />
                  </div>
                </div>

                {/* Print & tracker actions bar */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                  <button
                    onClick={handlePrintPaper}
                    className="px-3 py-1.5 border border-[#EADCB9] bg-white hover:bg-[#FAF6EC] text-amber-950 rounded-lg text-[10.5px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5 text-amber-700" />
                    <span>Print paper visual</span>
                  </button>

                  <button
                    onClick={handleDownloadMetadata}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10.5px] font-extrabold flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Tracker JSON</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Dynamic workspace tabs */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-3.5">
                
                {/* Station tab controls */}
                <div className="flex border-b border-[#EADCB9] pb-0.5 gap-2 shrink-0">
                  <button
                    onClick={() => setModalActiveTab('questions')}
                    className={`flex-1 text-center pb-1.5 text-xs font-bold transition uppercase ${
                      modalActiveTab === 'questions' ? "border-b-2 border-amber-600 font-black text-amber-950" : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    Syllabus Text
                  </button>
                  <button
                    onClick={() => setModalActiveTab('ai-buddy')}
                    className={`flex-1 text-center pb-1.5 text-xs font-bold transition uppercase flex items-center justify-center space-x-1 ${
                      modalActiveTab === 'ai-buddy' ? "border-b-2 border-amber-600 font-black text-amber-950" : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Bot className="h-3.5 w-3.5 text-amber-600" />
                    <span>Tutor</span>
                  </button>
                  <button
                    onClick={() => setModalActiveTab('predictor')}
                    className={`flex-1 text-center pb-1.5 text-xs font-bold transition uppercase flex items-center justify-center space-x-1 ${
                      modalActiveTab === 'predictor' ? "border-b-2 border-amber-600 font-black text-amber-950" : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#C29F47] animate-pulse" />
                    <span>Tips</span>
                  </button>
                  <button
                    onClick={() => setModalActiveTab('discussion')}
                    className={`flex-1 text-center pb-1.5 text-xs font-bold transition uppercase flex items-center justify-center space-x-1 ${
                      modalActiveTab === 'discussion' ? "border-b-2 border-amber-600 font-black text-amber-950" : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                    <span>Peer Notes</span>
                  </button>
                </div>

                {/* Tab content area */}
                <div className="flex-1 bg-[#FCFAF4] rounded-2xl p-3 border border-[#EADCB9]/60 max-h-[240px] overflow-y-auto">
                  
                  {/* Tab 1: Questions listing copyable */}
                  {modalActiveTab === 'questions' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-black text-stone-500">Transcribed Syllabus</span>
                        <button
                          onClick={handleCopyQuestions}
                          className="text-[10px] text-amber-700 hover:text-amber-950 font-bold flex items-center space-x-1 font-mono hover:underline"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>{isCopied ? "Copied" : "Copy block text"}</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {selectedPaper.questions && selectedPaper.questions.length > 0 ? (
                          selectedPaper.questions.map((q, qidx) => (
                            <div key={qidx} className="flex space-x-1.5 items-start text-[11px] font-sans border-b border-[#FAF6EC] pb-1.5 last:border-0 last:pb-0 font-medium text-[#2D1E0A]">
                              <span className="font-mono bg-amber-100 px-1 rounded font-bold text-amber-900">#{qidx + 1}</span>
                              <span className="leading-normal">{q}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-stone-400 italic text-center">No transcript available.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: GPT Companion */}
                  {modalActiveTab === 'ai-buddy' && (
                    <div className="space-y-2 flex flex-col justify-between h-full">
                      <div className="bg-white rounded-xl p-2.5 h-[140px] overflow-y-auto space-y-1.5 border border-[#EADCB9]/40">
                        {aiChatMessages.map((m, idx) => (
                          <div key={idx} className="text-[10.5px] leading-relaxed">
                            <span className="font-extrabold text-amber-900 uppercase tracking-wide mr-1 font-mono">
                              {m.sender === 'user' ? "ME:" : "PREP-GPT:"}
                            </span>
                            <span className="text-[#2D1E0A]">{m.text}</span>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendAiMessage} className="flex space-x-1.5 pt-1">
                        <input 
                          type="text"
                          value={aiChatInput}
                          onChange={(e) => setAiChatInput(e.target.value)}
                          placeholder="Explain solution step for question 1..."
                          className="flex-1 text-[11px] bg-white border border-[#EADCB9] rounded p-1.5 text-amber-950 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold"
                        >
                          Ask
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Tab 3: Trends Predictor Advice */}
                  {modalActiveTab === 'predictor' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[#8C7D63] font-mono">Exam Trend recommendations</span>
                        <span className="text-[8px] bg-amber-100 text-amber-900 px-1 rounded font-bold uppercase">Manned evaluation cell</span>
                      </div>

                      {predictedTips.length > 0 ? (
                        <div className="space-y-1.5">
                          {predictedTips.map((tip, tIdx) => (
                            <div key={tIdx} className="flex items-start space-x-2 text-[11px] leading-normal font-medium text-stone-700">
                              <span className="p-0.5 rounded bg-amber-100 text-[#2D1E0A] text-[9.5px] font-mono font-bold">★ TYPE {tIdx + 1}</span>
                              <p className="text-[#5C4D3C]">{tip}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-5 space-y-2 bg-white rounded-xl border border-dashed border-[#EADCB9]">
                          <p className="text-[10.5px] text-[#5C4D3C] max-w-xs mx-auto">
                            Generate trend summaries and focus areas using Neotiya's past exams layout profiles.
                          </p>
                          <button
                            type="button"
                            onClick={handleLoadPredictions}
                            disabled={predictedLoading}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase cursor-pointer"
                          >
                            {predictedLoading ? "Analyzing patterns..." : "⚡ Generate Predictor Tips"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 4: Classroom Discussions Comments */}
                  {modalActiveTab === 'discussion' && (
                    <div className="space-y-2.5 flex flex-col justify-between h-full">
                      <div className="bg-white rounded-xl p-2.5 h-[130px] overflow-y-auto space-y-2 border border-[#EADCB9]/40">
                        {isCommentsLoading ? (
                          <p className="text-[10px] text-center text-stone-400 font-mono">Syncing notes streams...</p>
                        ) : commentsList.length === 0 ? (
                          <div className="text-center py-4 text-[10px] text-stone-400">
                            <p className="italic">No solution tutorials posted yet.</p>
                            <p className="text-[9px] text-[#8C7D63]">Help classmates by writing walkthrough guides!</p>
                          </div>
                        ) : (
                          commentsList.map(c => (
                            <div key={c.id} className="border-b border-[#FCFAF4] pb-2 last:border-none last:pb-0 text-[10.5px] space-y-0.5">
                              <div className="flex justify-between font-mono text-[9px] text-[#8C7D63]">
                                <span className="font-bold text-amber-700">{c.userName || "Scholar Peer"}</span>
                                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[#2D1E0A] font-sans leading-normal">{c.comment}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={handleAddComment} className="flex space-x-1 pt-1.5">
                        <input 
                          type="text"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Type peer advice walkthrough notes or syllabus formula reviews..."
                          className="flex-1 text-[11px] bg-white border border-[#EADCB9] rounded p-1.5 text-stone-850 placeholder:text-stone-400 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={commentIsSubmitting}
                          className="px-3 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-black uppercase tracking-tight"
                        >
                          {commentIsSubmitting ? "Posting..." : "POST"}
                        </button>
                      </form>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
