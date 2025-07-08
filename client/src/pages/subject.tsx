import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { RecordedLecture } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getSubjectColor, getSubjectIcon } from "@/lib/utils";

import Navigation from "@/components/navigation";
import RecordedLectureItem from "@/components/recorded-lecture-item";
import LectureActionModal from "@/components/lecture-action-modal";

import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Subject() {
  const [match, params] = useRoute("/subject/:subject");
  const subject = params?.subject || "";
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<RecordedLecture | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lectures = [], isLoading } = useQuery<RecordedLecture[]>({
    queryKey: ["/api/recorded-lectures", subject],
    queryFn: () => fetch(`/api/recorded-lectures/subject/${subject}`).then(res => res.json()),
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (lectureId: number) => {
      const response = await apiRequest("PATCH", `/api/recorded-lectures/${lectureId}/bookmark`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recorded-lectures", subject] });
      toast({
        title: "Success",
        description: "Bookmark updated",
      });
    },
  });

  const handleShowActions = (lecture: RecordedLecture) => {
    setSelectedLecture(lecture);
    setIsActionModalOpen(true);
  };

  const handlePlayLecture = () => {
    if (selectedLecture) {
      const videoId = selectedLecture.youtubeUrl.split('/').pop();
      const title = encodeURIComponent(selectedLecture.title);
      window.location.href = `/player.html?video=${videoId}&title=${title}`;
    }
  };

  const handleBookmarkLecture = (lecture: RecordedLecture) => {
    bookmarkMutation.mutate(lecture.id);
  };

  const goBack = () => {
    window.history.back();
  };

  const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
  const subjectDescriptions = {
    physics: "Explore the fundamental laws of nature",
    chemistry: "Master chemical reactions and molecular structures",
    botany: "Understand plant life and biological processes",
    zoology: "Study animal biology and genetic principles",
  };

  if (!match) {
    return <div>Subject not found</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={goBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className={`${getSubjectColor(subject)} rounded-3xl p-8 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <i className={`${getSubjectIcon(subject)} text-3xl`}></i>
                </div>
                <div>
                  <h1 className="text-4xl font-bold">{subjectName}</h1>
                  <p className="text-lg opacity-90">
                    {subjectDescriptions[subject as keyof typeof subjectDescriptions]}
                  </p>
                </div>
              </div>
              <div className="text-sm opacity-80">
                {lectures.length} recorded lectures available
              </div>
            </div>
          </div>
        </div>

        {/* Lectures List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">{subjectName} Lectures</h2>
            <p className="text-sm text-gray-600">All recorded lectures for {subjectName.toLowerCase()}</p>
          </div>

          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : lectures.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {lectures.map((lecture) => (
                <RecordedLectureItem
                  key={lecture.id}
                  lecture={lecture}
                  onShowActions={handleShowActions}
                  onBookmark={handleBookmarkLecture}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Lectures Available</h3>
              <p className="text-gray-600 mb-6">
                No recorded lectures have been added for {subjectName.toLowerCase()} yet.
              </p>
              <Button onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Lecture Action Modal */}
      <LectureActionModal
        isOpen={isActionModalOpen}
        lecture={selectedLecture}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedLecture(null);
        }}
        onPlay={handlePlayLecture}
      />
    </div>
  );
}
