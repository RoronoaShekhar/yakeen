import { LiveLecture } from "@shared/schema";
import { getSubjectColor, getSubjectIcon } from "@/lib/utils";
import { Clock, Users, Play, Bell, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react"; // Import React

interface LiveLectureCardProps {
  lecture: LiveLecture;
  onJoin: (lecture: LiveLecture) => void;
}



export default function LiveLectureCard({ lecture, onJoin }: LiveLectureCardProps) {
  const isLive = lecture.isLive;
  const startingSoon = !isLive && lecture.startTime && new Date(lecture.startTime) > new Date();

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-sm card-hover relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${getSubjectColor(lecture.subject)} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              {React.createElement(getSubjectIcon(lecture.subject), { className: "h-5 w-5 text-white" })}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors duration-300 flex items-center gap-2">
                {lecture.title}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </h3>
              <p className="text-sm text-gray-600 font-medium">{lecture.subject}</p>
            </div>
          </div>

          <Badge 
            variant={lecture.status === 'live' ? 'destructive' : 'secondary'}
            className={`${
              lecture.status === 'live' 
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' 
                : 'bg-blue-100 text-blue-800 group-hover:bg-blue-200'
            } font-medium px-3 py-1 rounded-full transition-all duration-300`}
          >
            {lecture.status === 'live' ? '🔴 LIVE' : '⏰ Scheduled'}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 mb-4 px-6 relative z-10">
        <div className="flex items-center text-sm text-gray-600">
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
        <div className="flex items-center text-sm text-gray-600">
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
        className={`w-full py-3 rounded-xl font-semibold transition-colors duration-300 relative z-10 ${
          isLive
            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-200'
            : startingSoon
            ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md shadow-yellow-200'
            : 'bg-gray-500 text-white hover:bg-gray-600 shadow-md shadow-gray-200'
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
    </Card>
  );
}