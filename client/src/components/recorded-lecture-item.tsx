import { RecordedLecture } from "@shared/schema";
import { formatTimeAgo, formatViews, getSubjectColor } from "@/lib/utils";
import { Play, Download, Bookmark } from "lucide-react";

interface RecordedLectureItemProps {
  lecture: RecordedLecture;
  onShowActions: (lecture: RecordedLecture) => void;
  onBookmark: (lecture: RecordedLecture) => void;
}

export default function RecordedLectureItem({ 
  lecture, 
  onShowActions, 
  onBookmark 
}: RecordedLectureItemProps) {
  const subjectColors = {
    physics: 'bg-blue-100 text-blue-700',
    chemistry: 'bg-red-100 text-red-700',
    botany: 'bg-green-100 text-green-700',
    zoology: 'bg-purple-100 text-purple-700',
  };

  return (
    <div 
      className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
      onClick={() => onShowActions(lecture)}
    >
      <div className="flex items-center space-x-4">
        {/* Video Thumbnail */}
        <div className="flex-shrink-0 relative">
          <div className={`w-24 h-16 ${getSubjectColor(lecture.subject)} rounded-lg flex items-center justify-center`}>
            <Play className="text-white text-lg" />
          </div>
          {lecture.duration && (
            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
              {lecture.duration}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="text-base font-semibold text-gray-800 truncate">
                {lecture.title}
              </h5>
              <p className="text-sm text-gray-600">{lecture.instructor}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>{formatTimeAgo(lecture.uploadDate!)}</span>
                <span>{formatViews(lecture.views || 0)} views</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
                  subjectColors[lecture.subject as keyof typeof subjectColors] || 'bg-gray-100 text-gray-700'
                }`}>
                  {lecture.subject.charAt(0).toUpperCase() + lecture.subject.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                className={`p-2 transition-colors duration-200 ${
                  lecture.isBookmarked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(lecture);
                }}
                title="Bookmark"
              >
                <Bookmark className={`h-4 w-4 ${lecture.isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
