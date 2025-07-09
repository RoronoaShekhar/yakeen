import { LiveLecture } from "@shared/schema";
import { getSubjectColor, getSubjectIcon } from "@/lib/utils";
import { Clock, Users, Play, Bell } from "lucide-react";

interface LiveLectureCardProps {
  lecture: LiveLecture;
  onJoin: (lecture: LiveLecture) => void;
}

export default function LiveLectureCard({ lecture, onJoin }: LiveLectureCardProps) {
  const isLive = lecture.isLive;
  const startingSoon = !isLive && lecture.startTime && new Date(lecture.startTime) > new Date();

  return (
    <div className="card-modern hover:shadow-xl transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${getSubjectColor(lecture.subject)} rounded-xl flex items-center justify-center shadow-lg`}>
            <i className={`${getSubjectIcon(lecture.subject)} text-white`}></i>
          </div>
          <div>
            <h4 className="heading-secondary text-gray-800">{lecture.title}</h4>
            <p className="text-sm text-body">{lecture.instructor}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isLive 
            ? 'bg-red-100 text-red-700' 
            : startingSoon 
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {isLive && <i className="fas fa-circle text-red-500 text-xs mr-1"></i>}
          {startingSoon && <i className="fas fa-clock text-yellow-500 text-xs mr-1"></i>}
          {isLive ? 'Live' : startingSoon ? 'Starting Soon' : 'Scheduled'}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-body">
          <Clock className="mr-2 h-4 w-4 text-gray-400" />
          <span>
            {lecture.startTime 
              ? new Date(lecture.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Time TBD'
            } - {lecture.endTime 
              ? new Date(lecture.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'End TBD'
            }
          </span>
        </div>
        <div className="flex items-center text-sm text-body">
          <Users className="mr-2 h-4 w-4 text-gray-400" />
          <span>
            {isLive 
              ? `${lecture.viewers || 0} students watching`
              : `${Math.floor(Math.random() * 200) + 50} registered`
            }
          </span>
        </div>
      </div>
      
      <button 
        onClick={() => onJoin(lecture)}
        className={`w-full button-modern font-semibold ${
          isLive
            ? 'bg-gradient-hero text-white hover:opacity-90'
            : startingSoon
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:opacity-90'
            : 'bg-gray-500 text-white hover:bg-gray-600'
        }`}
      >
        {isLive ? (
          <>
            <Play className="inline mr-2 h-4 w-4" />
            Join Live
          </>
        ) : startingSoon ? (
          <>
            <Bell className="inline mr-2 h-4 w-4" />
            Set Reminder
          </>
        ) : (
          <>
            <Clock className="inline mr-2 h-4 w-4" />
            Scheduled
          </>
        )}
      </button>
    </div>
  );
}
