import { getSubjectColor, getSubjectIcon } from "@/lib/utils";

interface SubjectCardProps {
  subject: string;
  count: number;
  description: string;
  onClick: () => void;
}

export default function SubjectCard({ subject, count, description, onClick }: SubjectCardProps) {
  const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div 
      className={`${getSubjectColor(subject)} rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <i className={`${getSubjectIcon(subject)} text-3xl opacity-80`}></i>
        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
          {count}
        </span>
      </div>
      <h4 className="text-xl font-bold mb-1">{subjectName}</h4>
      <p className="text-sm opacity-80">{description}</p>
    </div>
  );
}
