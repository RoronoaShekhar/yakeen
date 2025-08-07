
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../hooks/use-toast";

interface AddLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LectureType = "live" | "recorded" | "bulk";

const subjectEnum = z.enum(["physics", "chemistry", "botany", "zoology"]);

const liveSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: subjectEnum,
  lectureUrl: z.string().regex(/^https:\/\/live-server\.dev-boi\.xyz/, {
    message: "Must be a valid live-server.dev-boi.xyz URL",
  }),
});

const recordedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: subjectEnum,
  youtubeUrl: z.string().regex(/^https:\/\/youtu\.be\/[a-zA-Z0-9_-]+$/, {
    message: "Must be a valid youtu.be URL",
  }),
});

const bulkSchema = z.object({
  lectures: z.string().min(1, "Bulk data is required"),
});

export default function AddLectureModal({ isOpen, onClose }: AddLectureModalProps) {
  const [lectureType, setLectureType] = useState<LectureType>("recorded");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getSchema = () => {
    if (lectureType === "live") return liveSchema;
    if (lectureType === "bulk") return bulkSchema;
    return recordedSchema;
  };

  const getDefaultValues = () => {
    if (lectureType === "live") {
      return { title: "", subject: "physics" as const, lectureUrl: "" };
    }
    if (lectureType === "bulk") {
      return { lectures: "" };
    }
    return { title: "", subject: "physics" as const, youtubeUrl: "" };
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  });

  // Reset form when modal opens/closes or lecture type changes
  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
    }
  }, [isOpen, lectureType]);

  const liveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof liveSchema>) => {
      const response = await fetch("/api/live-lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create live lecture");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-lectures"] });
      toast({
        title: "Success",
        description: "Live lecture added successfully!",
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const recordedMutation = useMutation({
    mutationFn: async (data: z.infer<typeof recordedSchema>) => {
      const response = await fetch("/api/recorded-lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create recorded lecture");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recorded-lectures"] });
      toast({
        title: "Success",
        description: "Recorded lecture added successfully!",
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bulkSchema>) => {
      let lectures;
      try {
        lectures = JSON.parse(data.lectures);
      } catch (error) {
        throw new Error("Invalid JSON format");
      }

      const response = await fetch("/api/recorded-lectures/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lectures }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process bulk lectures");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recorded-lectures"] });
      toast({
        title: "Success",
        description: data.message,
      });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: any) => {
    try {
      if (lectureType === "live") {
        liveMutation.mutate(data);
      } else if (lectureType === "bulk") {
        bulkMutation.mutate(data);
      } else {
        recordedMutation.mutate(data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to add lecture. Please check your inputs.",
        variant: "destructive"
      });
    }
  };

  const isLoading = liveMutation.isPending || recordedMutation.isPending || bulkMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Lecture</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="mb-4">
            <Label className="block text-sm font-medium mb-2">Lecture Type</Label>
            <Select value={lectureType} onValueChange={(v) => setLectureType(v as LectureType)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose lecture type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="recorded">Recorded</SelectItem>
                <SelectItem value="bulk">Bulk Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {lectureType === "bulk" ? (
            <div>
              <Label htmlFor="lectures">Bulk Lecture Data (JSON)</Label>
              <Textarea
                {...form.register("lectures")}
                placeholder='[{"subject": "physics", "lecture_name": "Title", "lecture_link": "https://youtu.be/..."}]'
                className="min-h-[100px]"
              />
              {form.formState.errors.lectures && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.lectures.message}
                </p>
              )}
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  {...form.register("title")}
                  placeholder="Enter lecture title"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={form.watch("subject")}
                  onValueChange={(value) => form.setValue("subject", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="botany">Botany</SelectItem>
                    <SelectItem value="zoology">Zoology</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={lectureType === "live" ? "lectureUrl" : "youtubeUrl"}>
                  {lectureType === "live" ? "Live Server URL" : "YouTube URL"}
                </Label>
                <Input
                  {...form.register(lectureType === "live" ? "lectureUrl" : "youtubeUrl")}
                  placeholder={
                    lectureType === "live"
                      ? "https://live-server.dev-boi.xyz/..."
                      : "https://youtu.be/..."
                  }
                />
                {((lectureType === "live" && form.formState.errors.lectureUrl) ||
                  (lectureType === "recorded" && form.formState.errors.youtubeUrl)) && (
                  <p className="text-red-500 text-sm mt-1">
                    {lectureType === "live"
                      ? form.formState.errors.lectureUrl?.message
                      : form.formState.errors.youtubeUrl?.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Lecture"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
