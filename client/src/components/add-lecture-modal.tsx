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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type LectureType = "live" | "recorded";

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

export default function AddLectureModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [lectureType, setLectureType] = useState<LectureType>("live");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(lectureType === "live" ? liveSchema : recordedSchema),
    defaultValues: {
      title: "",
      subject: undefined,
      lectureUrl: "",
      youtubeUrl: "",
    },
  });

  useEffect(() => {
    form.reset(); // Reset the form when switching types
  }, [lectureType]);

  const liveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof liveSchema>) => {
      const res = await apiRequest("POST", "/api/live-lectures", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/live-lectures"]);
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
      queryClient.invalidateQueries(["/api/recorded-lectures"]);
      toast({ title: "Success", description: "Recorded lecture added." });
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Lecture</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <FormLabel>Lecture Type</FormLabel>
          <Select value={lectureType} onValueChange={(v) => setLectureType(v as LectureType)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose lecture type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="recorded">Recorded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
