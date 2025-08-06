import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { LiveLecture, RecordedLecture } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import Navigation from "@/components/navigation";
import CountdownTimer from "@/components/countdown-timer";
import LiveLectureCard from "@/components/live-lecture-card";
import RecordedLectureItem from "@/components/recorded-lecture-item";
import SubjectCard from "@/components/subject-card";
import AddLectureModal from "@/components/add-lecture-modal";
import LectureActionModal from "@/components/lecture-action-modal";

import { Video, BookOpen, Clock, Trophy, Plus, ArrowRight, Calendar, GraduationCap, Atom, FlaskConical, Leaf, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useLocation()[1];

  const subjects = [
    {
      name: "Physics",
      icon: Atom,
      description: "Mechanics, Thermodynamics, Optics, and Modern Physics",
      color: "bg-gradient-physics",
    },
    {
      name: "Chemistry", 
      icon: FlaskConical,
      description: "Organic, Inorganic, and Physical Chemistry",
      color: "bg-gradient-chemistry",
    },
    {
      name: "Botany",
      icon: Leaf,
      description: "Plant Biology, Ecology, and Physiology", 
      color: "bg-gradient-botany",
    },
    {
      name: "Zoology",
      icon: Bug,
      description: "Animal Biology, Evolution, and Genetics",
      color: "bg-gradient-zoology",
    },
  ];

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

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        {/* Floating Elements - hidden on mobile for better performance */}
        <div className="hidden md:block absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl floating"></div>
        <div className="hidden md:block absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl floating" style={{animationDelay: '1s'}}></div>
        <div className="hidden md:block absolute bottom-20 left-1/4 w-16 h-16 bg-pink-400/20 rounded-full blur-xl floating" style={{animationDelay: '2s'}}></div>

        <div className="relative px-4 sm:px-6 py-16 sm:py-20 lg:py-24 mx-auto max-w-7xl lg:px-8">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <div className="inline-block p-3 sm:p-4 rounded-full bg-white/10 backdrop-blur-sm mb-4 sm:mb-6">
                <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
              <span className="text-gradient-hero">NEET Study Hub</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl leading-6 sm:leading-7 md:leading-8 text-gray-300 max-w-xl md:max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
              Master NEET preparation with our comprehensive live lectures, recorded sessions, 
              and expert-curated study materials across all four core subjects.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-900 hover:bg-gray-100 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                Start Learning
                <BookOpen className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-900 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                View Schedule
                <Calendar className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent"></div>
        <div className="mx-auto max-w-7xl relative">
          <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <div className="inline-block p-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-gradient-primary">Choose Your Subject</span>
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-xl lg:max-w-2xl mx-auto px-4">
              Dive deep into each NEET subject with our expertly designed curriculum and interactive learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {subjects.map((subject, index) => (
              <div 
                key={subject.name}
                className="transform transition-all duration-500"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <SubjectCard
                  {...subject}
                  onClick={() => navigate(`/subject/${subject.name.toLowerCase()}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <CountdownTimer />

        {/* Live Lectures Section */}
        <section id="live" className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Live Lectures</h3>
              <p className="text-sm sm:text-base text-gray-600">Join ongoing and upcoming sessions</p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-sm sm:text-base"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Live Lecture
            </Button>
          </div>

          {isLoadingLive ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-24 sm:h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : liveLectures.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {liveLectures.map((lecture) => (
                <LiveLectureCard
                  key={lecture.id}
                  lecture={lecture}
                  onJoin={handleJoinLecture}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 bg-white rounded-2xl shadow-sm border border-gray-100 mx-2 sm:mx-0">
              <Video className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
              <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Live Lectures</h4>
              <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">No live lectures are currently scheduled.</p>
              <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="text-sm">
                <Plus className="mr-2 h-4 w-4" />
                Add First Live Lecture
              </Button>
            </div>
          )}
        </section>

        {/* Recorded Lectures by Subject */}
        <section id="recorded" className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Recorded Lectures</h3>
              <p className="text-sm sm:text-base text-gray-600">Browse by subject and study at your pace</p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              variant="outline"
              className="w-full sm:w-auto text-sm sm:text-base"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Lecture
            </Button>
          </div>

          {/* Subject Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.name}
                name={subject.name}
                description={subject.description}
                icon={subject.icon}
                color={subject.color}
                onClick={() => {
                  // Navigate to subject page
                  window.location.href = `/subject/${subject.name.toLowerCase()}`;
                }}
              />
            ))}
          </div>

          {/* Recent Recorded Lectures List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-lg font-semibold text-gray-800">Recent Recordings</h4>
              <p className="text-sm text-gray-600">Latest lectures added to the library</p>
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
                    />
                  ))}
                </div>

                <div className="p-6 border-t border-gray-100 text-center">
                  <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200">
                    View All Recordings <ArrowRight className="inline ml-1 h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Recorded Lectures</h4>
                <p className="text-gray-600 mb-4">No recorded lectures have been added yet.</p>
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Lecture
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gradient-primary">NEET Study Hub</h3>
                </div>
              </div>
              <p className="text-gray-600 max-w-md">
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