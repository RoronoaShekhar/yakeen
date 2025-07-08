import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertLiveLectureSchema, insertRecordedLectureSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

  const resetAllForms = () => {
    liveLectureForm.reset();
    recordedLectureForm.reset();
    setLectureType("live");
  };

  // Reset forms when modal is closed
  const handleClose = () => {
    resetAllForms();
    onClose();
  };

  const liveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/live-lectures", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-lectures"] });
      toast({
        title: "Success",
        description: "Live lecture added successfully",
      });
      resetAllForms();
      onClose();
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
      const response = await apiRequest("POST", "/api/recorded-lectures", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recorded-lectures"] });
      toast({
        title: "Success",
        description: "Recorded lecture added successfully",
      });
      resetAllForms();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add recorded lecture",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (lectureType === "live") {
      liveMutation.mutate(data);
    } else {
      recordedMutation.mutate(data);
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Lecture</DialogTitle>
          <DialogDescription>
            Add a new live or recorded lecture to the platform
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="lectureType"
              render={() => (
                <FormItem>
                  <FormLabel>Lecture Type</FormLabel>
                  <Select
                    value={lectureType}
                    onValueChange={(value: LectureType) => setLectureType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live Lecture</SelectItem>
                      <SelectItem value="recorded">Recorded Lecture</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lecture title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {lectureType === "live" ? (
              <FormField
                control={form.control}
                name="lectureUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecture Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://live-server.dev-boi.xyz/..." {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">Only live-server.dev-boi.xyz links are accepted</p>
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtu.be/..." {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">Only youtu.be links are supported</p>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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



            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={liveMutation.isPending || recordedMutation.isPending}
              >
                {(liveMutation.isPending || recordedMutation.isPending) ? "Adding..." : "Add Lecture"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
