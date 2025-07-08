import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { useToast } from "@/hooks/use-toast";

type LectureType = "live" | "recorded";

const liveSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.enum(["physics", "chemistry", "botany", "zoology"]),
  lectureUrl: z
    .string()
    .regex(/^https:\/\/live-server\.dev-boi\.xyz/, "Invalid live-server URL"),
});

const recordedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.enum(["physics", "chemistry", "botany", "zoology"]),
  youtubeUrl: z
    .string()
    .regex(/^https:\/\/youtu\.be\/[a-zA-Z0-9_-]+$/, "Invalid YouTube URL"),
});

interface AddLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddLectureModal({ isOpen, onClose }: AddLectureModalProps) {
  const [lectureType, setLectureType] = useState<LectureType>("live");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const schema = lectureType === "live" ? liveSchema : recordedSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      subject: undefined,
      lectureUrl: "",
      youtubeUrl: "",
    } as any,
  });

  // Reset form whenever lecture type changes
  useEffect(() => {
    form.reset({
      title: "",
      subject: undefined,
      lectureUrl: "",
      youtubeUrl: "",
    });
  }, [lectureType]);

  const liveMutation = useMutation({
    mutationFn: (data: z.infer<typeof liveSchema>) =>
      apiRequest("POST", "/api/live-lectures", data).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-lectures"] });
      toast({ title: "Success", description: "Live lecture added." });
      onClose();
    },
  });

  const recordedMutation = useMutation({
    mutationFn: (data: z.infer<typeof recordedSchema>) =>
      apiRequest("POST", "/api/recorded-lectures", data).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recorded-lectures"] });
      toast({ title: "Success", description: "Recorded lecture added." });
      onClose();
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (lectureType === "live") {
      liveMutation.mutate(data);
    } else {
      recordedMutation.mutate(data);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Lecture</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <FormLabel>Lecture Type</FormLabel>
          <Select value={lectureType} onValueChange={(val) => setLectureType(val as LectureType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="recorded">Recorded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title" {...field} />
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
                    <FormLabel>Live Link</FormLabel>
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

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button variant="outline" type="button" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" type="submit">
                Add Lecture
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
            }
