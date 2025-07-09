import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { LiveLecture, RecordedLecture } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import Navigation from "@/components/navigation";
import CountdownTimer from "@/components/countdown-timer";
import LiveLectureCard from "@/components/live-lecture-card";
import RecordedLectureItem from "@/components/recorded-lecture-item";
import SubjectCard from "@/components/subject-card";
import AddLectureModal from "@/components/add-lecture-modal";
import LectureActionModal from "@/components/lecture-action-modal";

import { Video, BookOpen, Clock, Trophy, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<RecordedLecture | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: liveLectures = [], isLoading: isLoadingLive } = useQuery<LiveLecture[]>({
    queryKey: ["/api/live-lectures"],
  });

  const { data: recordedLectures = [], isLoading: isLoadingRecorded } = useQuery<RecordedLecture[]>({
    queryKey: ["/api/recorded-lectures"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Mutations
  const bookmarkMutation = useMutation({
    mutationFn: async (lectureId: number) => {
      const response = await apiRequest("PATCH", `/api/recorded-lectures/${lectureId}/bookmark`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recorded-lectures"] });
      toast({
        title: "Success",
        description: "Bookmark updated",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (lectureId: number) => {
      const response = await apiRequest("DELETE", `/api/recorded-lectures/${lectureId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recorded-lectures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Lecture deleted successfully",
      });
    },
  });

  // Handlers
  const handleJoinLecture = (lecture: LiveLecture) => {
    if (lecture.lectureUrl) {
      window.open(lecture.lectureUrl, '_blank');
    }
  };

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

  const handleDeleteLecture = (lecture: RecordedLecture) => {
    if (confirm(`Are you sure you want to delete "${lecture.title}"?`)) {
      deleteMutation.mutate(lecture.id);
    }
  };

  const subjectDescriptions = {
    physics: "Mechanics, Thermodynamics, Optics",
    chemistry: "Organic, Inorganic, Physical",
    botany: "Plant Biology, Ecology",
    zoology: "Animal Biology, Genetics",
  };

  const recentLectures = recordedLectures.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CountdownTimer />



        {/* Live Lectures Section */}
        <section id="live" className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className="text-2xl heading-secondary text-gray-800 mb-2">Live Lectures</h3>
              <p className="text-body">Join ongoing and upcoming sessions</p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 sm:mt-0 bg-gradient-hero button-modern"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Live Lecture
            </Button>
          </div>

          {isLoadingLive ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-modern p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : liveLectures.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveLectures.map((lecture) => (
                <LiveLectureCard
                  key={lecture.id}
                  lecture={lecture}
                  onJoin={handleJoinLecture}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card-modern">
              <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg heading-secondary text-gray-900 mb-2">No Live Lectures</h4>
              <p className="text-body mb-4">No live lectures are currently scheduled.</p>
              <Button onClick={() => setIsAddModalOpen(true)} className="button-modern bg-gradient-hero">
                <Plus className="mr-2 h-4 w-4" />
                Add First Live Lecture
              </Button>
            </div>
          )}
        </section>

        {/* Recorded Lectures by Subject */}
        <section id="recorded" className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className="text-2xl heading-secondary text-gray-800 mb-2">Recorded Lectures</h3>
              <p className="text-body">Browse by subject and study at your pace</p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="outline"
              className="button-modern"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Lecture
            </Button>
          </div>

          {/* Subject Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {Object.entries(subjectDescriptions).map(([subject, description]) => (
              <SubjectCard
                key={subject}
                subject={subject}
                count={stats?.subjects?.[subject as keyof typeof stats.subjects] || 0}
                description={description}
                onClick={() => {
                  // Navigate to subject page
                  window.location.href = `/subject/${subject}`;
                }}
              />
            ))}
          </div>

          {/* Recent Recorded Lectures List */}
          <div className="card-modern overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-lg heading-secondary text-gray-800">Recent Recordings</h4>
              <p className="text-sm text-body">Latest lectures added to the library</p>
            </div>

            {isLoadingRecorded ? (
              <div className="divide-y divide-gray-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentLectures.length > 0 ? (
              <>
                <div className="divide-y divide-gray-100">
                  {recentLectures.map((lecture) => (
                    <RecordedLectureItem
                      key={lecture.id}
                      lecture={lecture}
                      onShowActions={handleShowActions}
                      onBookmark={handleBookmarkLecture}
                      onDelete={handleDeleteLecture}
                    />
                  ))}
                </div>

                <div className="p-6 border-t border-gray-100 text-center">
                  <button className="text-primary font-medium hover:text-primary/80 transition-colors duration-200">
                    View All Recordings <ArrowRight className="inline ml-1 h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg heading-secondary text-gray-900 mb-2">No Recorded Lectures</h4>
                <p className="text-body mb-4">No recorded lectures have been added yet.</p>
                <Button onClick={() => setIsAddModalOpen(true)} className="button-modern bg-gradient-hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Lecture
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-graduation-cap text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl heading-primary text-gradient-primary">NEET Study Hub</h3>
                </div>
              </div>
              <p className="text-body max-w-md">
                Your comprehensive platform for NEET preparation with live lectures, recorded sessions, 
                and expert guidance to achieve your medical career goals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#live" className="hover:text-blue-600 transition-colors duration-200">Live Lectures</a></li>
                <li><a href="#recorded" className="hover:text-blue-600 transition-colors duration-200">Recorded Sessions</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Study Plans</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Mock Tests</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Technical Support</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors duration-200">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 NEET Study Hub. All rights reserved. Helping students achieve their medical dreams.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddLectureModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

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
