import React from "react";
import { FileText, Eye, Download, Bookmark, Star, Calendar, Building, GraduationCap, Clock } from "lucide-react";
import { Paper } from "../types";

interface PaperCardProps {
  key?: any;
  paper: Paper;
  onSelect: (paper: Paper) => void;
  onBookmark?: (id: string, e: React.MouseEvent) => void;
}

export default function PaperCard({ paper, onSelect, onBookmark }: PaperCardProps) {
  const isPending = paper.status === "pending";

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case "Final": return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/50";
      case "Midterm": return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50";
      default: return "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 (dark:border-blue-900/50)";
    }
  };

  return (
    <div 
      id={`paper-card-${paper.id}`}
      onClick={() => onSelect(paper)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-400 dark:hover:border-blue-800 hover:shadow-xl hover:shadow-blue-550/5 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]"
    >
      {/* Upper Category Badges */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1 rounded-md font-semibold border border-slate-250/50 dark:border-slate-705/50">
          {paper.subjectCode}
        </span>
        
        <div className="flex items-center space-x-1.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${getExamTypeColor(paper.examType)}`}>
            {paper.examType}
          </span>
          {isPending && (
            <span className="text-[10px] bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 px-2 py-0.5 rounded-full font-bold animate-pulse">
              PENDING VALIDATION
            </span>
          )}
        </div>
      </div>

      {/* Main Metadata */}
      <div className="space-y-2 flex-grow text-left">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-550 transition-colors line-clamp-2 leading-relaxed">
          {paper.title}
        </h3>
        
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate max-w-[180px]">{paper.subjectName}</span>
          <span>&middot;</span>
          <span className="font-mono">Sem {paper.semester}</span>
        </div>

        <div className="flex items-center text-[11px] text-slate-450 dark:text-slate-500 space-x-1.5 leading-none">
          <Building className="h-3 w-3 shrink-0" />
          <span className="truncate">{paper.university}</span>
        </div>
      </div>

      {/* Tags Slider */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-4">
          {paper.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[9px] font-sans bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
          {paper.tags.length > 3 && (
            <span className="text-[9px] text-slate-400 font-mono">+{paper.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-850/80 my-4"></div>

      {/* Stats Counter Bar & Contributor */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        
        {/* Contributor Profile */}
        <div className="flex items-center space-x-1.5 min-w-[100px] truncate" title={`Uploaded by ${paper.uploaderName}`}>
          <img 
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(paper.uploaderName)}`} 
            className="w-4 h-4 rounded-full bg-slate-100" 
            alt="Uploader avatar"
          />
          <span className="text-[10px] text-slate-500 font-medium truncate shrink-0 max-w-[80px]">
            {paper.uploaderName.split(" ")[0]}
          </span>
        </div>

        {/* Counters */}
        <div className="flex items-center space-x-3 shrink-0">
          <span className="flex items-center space-x-0.5 text-slate-400" title="Views">
            <Eye className="h-3 w-3" />
            <span className="font-mono text-[10px]">{paper.views || 0}</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-slate-700 dark:text-slate-300" title="Downloads">
            <Download className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-mono text-[10px]">{paper.downloads || 0}</span>
          </span>

          {onBookmark && (
            <button
              onClick={(e) => onBookmark(paper.id, e)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-blue-500 transition-colors"
              title="Bookmark question paper"
            >
              <Bookmark className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
