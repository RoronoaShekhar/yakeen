import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AddLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LectureType = "live" | "recorded";

const liveLectureFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.enum(["physics", "chemistry", "botany", "zoology"]),
  lectureUrl: z.string().regex(/^https:\/\/live-server\.dev-boi\.xyz/, "Please provide a valid live-server.dev-boi.xyz URL"),
});

const recordedLectureFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.enum(["physics", "chemistry", "botany", "zoology"]),
  youtubeUrl: z.string().regex(/^https:\/\/youtu\.be\/[a-zA-Z0-9_-]+$/, "Please provide a valid youtu.be URL"),
});

export default function AddLectureModal({ isOpen, onClose }: AddLectureModalProps) {
  const [lectureType, setLectureType] = useState<LectureType>("live");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const liveLectureForm = useForm({
    resolver: zodResolver(liveLectureFormSchema),
    defaultValues: {
      title: "",
      subject: undefined,
      lectureUrl: "",
    },
  });

  const recordedLectureForm = useForm({
    resolver: zodResolver(recordedLectureFormSchema),
    defaultValues: {
      title: "",
      subject: undefined,
      youtubeUrl: "",
    },
  });

  const form = lectureType === "live" ? liveLectureForm : recordedLectureForm;

  useEffect(() => {
    console.log("🔄 Lecture type changed to:", lectureType);
    console.log("Live values:", liveLectureForm.getValues());
    console.log("Recorded values:", recordedLectureForm.getValues());
  }, [lectureType]);

  const handleClose = () => {
    liveLectureForm.reset();
    recordedLectureForm.reset();
    setLectureType("live");
    onClose();
  };

  const onSubmit = (data: any) => {
    console.log("📤 Submitting Data:", data);
    if (lectureType === "live") {
      liveMutation.mutate(data);
    } else {
      recordedMutation.mutate(data);
    }
  };

  const liveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/live-lectures", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-lectures"] });
      toast({ title: "Success", description: "Live lecture added successfully" });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add live lecture",
        variant: "destructive",
      });
    },
  });

  const recordedMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/recorded-lectures", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recorded-lectures"] });
      toast({ title: "Success", description: "Recorded lecture added successfully" });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add recorded lecture",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Lecture</DialogTitle>
        </DialogHeader>

        {/* Lecture Type Switch */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">Lecture Type</label>
          <Select value={lectureType} onValueChange={setLectureType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live Lecture</SelectItem>
              <SelectItem value="recorded">Recorded Lecture</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onKeyDown={(e) => console.log("🎯 Title Key:", e.key)}
                      onChange={(e) => {
                        console.log("✏️ Title:", e.target.value);
                        field.onChange(e);
                      }}
                      placeholder="Enter title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL */}
            {lectureType === "live" ? (
              <FormField
                control={form.control}
                name="lectureUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Live Lecture URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={(e) => console.log("🎯 Live URL Key:", e.key)}
                        onChange={(e) => {
                          console.log("✏️ Live URL:", e.target.value);
                          field.onChange(e);
                        }}
                        placeholder="https://live-server.dev-boi.xyz/..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onKeyDown={(e) => console.log("🎯 YT URL Key:", e.key)}
                        onChange={(e) => {
                          console.log("✏️ YT URL:", e.target.value);
                          field.onChange(e);
                        }}
                        placeholder="https://youtu.be/..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="botany">Botany</SelectItem>
                      <SelectItem value="zoology">Zoology</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {lectureType === "live" && liveMutation.isPending
                  ? "Adding..."
                  : lectureType === "recorded" && recordedMutation.isPending
                  ? "Adding..."
                  : "Add Lecture"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
