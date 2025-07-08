import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
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

interface AddLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LectureType = "live" | "recorded";

const liveSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.enum(["physics", "chemistry", "botany", "zoology"]),
  lectureUrl: z.string().regex(/^https:\/\/live-server\.dev-boi\.xyz/, "Live link must start with https://live-server.dev-boi.xyz"),
});

const recordedSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.enum(["physics", "chemistry", "botany", "zoology"]),
  youtubeUrl: z.string().regex(/^https:\/\/youtu\.be\/[a-zA-Z0-9_-]+$/, "Only youtu.be links allowed"),
});

export default function AddLectureModal({ isOpen, onClose }: AddLectureModalProps) {
  const [lectureType, setLectureType] = useState<LectureType>("live");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const liveForm = useForm({
    resolver: zodResolver(liveSchema),
    defaultValues: { title: "", subject: undefined, lectureUrl: "" },
  });

  const recordedForm = useForm({
    resolver: zodResolver(recordedSchema),
    defaultValues: { title: "", subject: undefined, youtubeUrl: "" },
  });

  const liveMutation = useMutation({
    mutationFn: async (data: z.infer<typeof liveSchema>) => {
      const res = await apiRequest("POST", "/api/live-lectures", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-lectures"] });
      toast({ title: "Success", description: "Live lecture added" });
      liveForm.reset();
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add live lecture", variant: "destructive" });
    },
  });

  const recordedMutation = useMutation({
    mutationFn: async (data: z.infer<typeof recordedSchema>) => {
      const res = await apiRequest("POST", "/api/recorded-lectures", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recorded-lectures"] });
      toast({ title: "Success", description: "Recorded lecture added" });
      recordedForm.reset();
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add recorded lecture", variant: "destructive" });
    },
  });

  const handleClose = () => {
    liveForm.reset();
    recordedForm.reset();
    setLectureType("live");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Lecture</DialogTitle>
        </DialogHeader>

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

        {lectureType === "live" ? (
          <Form {...liveForm}>
            <form onSubmit={liveForm.handleSubmit(liveMutation.mutate)} className="space-y-4">
              <FormField
                control={liveForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Lecture title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={liveForm.control}
                name="lectureUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecture Link</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://live-server.dev-boi.xyz/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={liveForm.control}
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
              <div className="flex space-x-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={liveMutation.isPending}>
                  {liveMutation.isPending ? "Adding..." : "Add Lecture"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...recordedForm}>
            <form onSubmit={recordedForm.handleSubmit(recordedMutation.mutate)} className="space-y-4">
              <FormField
                control={recordedForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Lecture title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={recordedForm.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Link</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://youtu.be/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={recordedForm.control}
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
              <div className="flex space-x-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={recordedMutation.isPending}>
                  {recordedMutation.isPending ? "Adding..." : "Add Lecture"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
