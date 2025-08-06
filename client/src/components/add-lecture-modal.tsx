
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
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type LectureType = "live" | "recorded" | "bulk";

const subjectEnum = z.enum(["physics", "chemistry", "botany", "zoology"]);

const liveSchema = z.object({
  title: z.string().min(1),
  subject: subjectEnum,
  lectureUrl: z.string().regex(/^https:\/\/live-server\.dev-boi\.xyz/, {
    message: "Must be a valid live-server.dev-boi.xyz URL",
  }),
});

const recordedSchema = z.object({
  title: z.string().min(1),
  subject: subjectEnum,
  youtubeUrl: z.string().regex(/^https:\/\/youtu\.be\/[a-zA-Z0-9_-]+$/, {
    message: "Must be a valid youtu.be URL",
  }),
});

const bulkSchema = z.object({
  bulkData: z.string().min(1, "Bulk data is required"),
});

export default function AddLectureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [lectureType, setLectureType] = useState<LectureType>("live");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getSchema = () => {
    if (lectureType === "live") return liveSchema;
    if (lectureType === "bulk") return bulkSchema;
    return recordedSchema;
  };

  const getDefaultValues = () => {
    if (lectureType === "live") {
      return { title: "", subject: undefined, lectureUrl: "" };
    } else if (lectureType === "bulk") {
      return { bulkData: "" };
    } else {
      return { title: "", subject: undefined, youtubeUrl: "" };
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    form.reset(getDefaultValues());
  }, [lectureType]);

  const liveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof liveSchema>) => {
      const res = await apiRequest("POST", "/api/live-lectures", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-lectures"] });
      toast({ title: "Success", description: "Live lecture added." });
      onClose();
    },
  });

  const recordedMutation = useMutation({
    mutationFn: async (data: z.infer<typeof recordedSchema>) => {
      const res = await apiRequest("POST", "/api/recorded-lectures", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recorded-lectures"] });
      toast({ title: "Success", description: "Recorded lecture added." });
      onClose();
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (data: z.infer<typeof bulkSchema>) => {
      try {
        const parsedData = JSON.parse(data.bulkData);
        const res = await apiRequest("POST", "/api/recorded-lectures/bulk", { lectures: parsedData });
        return res.json();
      } catch (error) {
        throw new Error("Invalid JSON format");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/recorded-lectures"] });
      toast({ title: "Success", description: data.message });
      onClose();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to process bulk data",
        variant: "destructive"
      });
    },
  });

  const onSubmit = (data: any) => {
    if (lectureType === "live") {
      liveMutation.mutate(data);
    } else if (lectureType === "bulk") {
      bulkMutation.mutate(data);
    } else {
      recordedMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Lecture</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Lecture Type</label>
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {lectureType === "bulk" ? (
              <FormField
                control={form.control}
                name="bulkData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bulk Lecture Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={`[
  {
    "subject": "physics",
    "lecture_name": "Kinematics Basics",
    "lecture_link": "https://youtu.be/example1"
  },
  {
    "subject": "chemistry",
    "lecture_name": "Atomic Structure",
    "lecture_link": "https://youtu.be/example2"
  }
]`}
                        className="min-h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter JSON array with subject, lecture_name, and lecture_link fields
                    </p>
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Lecture title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
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
                        <FormLabel>Live Lecture Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://live-server.dev-boi.xyz/..." {...field} />
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
                        <FormLabel>YouTube Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtu.be/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" type="button" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Lecture
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
