import { LiveLecture } from "@shared/schema";
import { getSubjectColor, getSubjectIcon } from "@/lib/utils";
import { Clock, Users, Play, Bell, ArrowRight, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react"; // Import React
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";

interface LiveLectureCardProps {
  lecture: LiveLecture;
  onJoin: (lecture: LiveLecture) => void;
}



export default function LiveLectureCard({ lecture, onJoin }: LiveLectureCardProps) {
  const isLive = lecture.isLive;
  const startingSoon = !isLive && lecture.startTime && new Date(lecture.startTime) > new Date();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/live-lectures/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete lecture');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-lectures"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({
        title: "Success",
        description: "Live lecture deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete lecture",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this live lecture?")) {
      deleteMutation.mutate(lecture.id);
    }
  };

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

      <div className="flex gap-2 px-6 pb-6">
        <Button asChild className="flex-1">
          <a href={lecture.lectureUrl} target="_blank" rel="noopener noreferrer">
            <Play className="inline mr-2 h-4 w-4" />
            Join Live
          </a>
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}