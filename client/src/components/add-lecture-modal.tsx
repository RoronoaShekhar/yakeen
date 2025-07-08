import { useEffect, useState } from "react"; import { useForm } from "react-hook-form"; import { zodResolver } from "@hookform/resolvers/zod"; import { useMutation, useQueryClient } from "@tanstack/react-query"; import { z } from "zod"; import { apiRequest } from "@/lib/queryClient";

import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog"; import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"; import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"; import { Input } from "@/components/ui/input"; import { Button } from "@/components/ui/button"; import { useToast } from "@/hooks/use-toast";

interface AddLectureModalProps { isOpen: boolean; onClose: () => void; }

type LectureType = "live" | "recorded";

// Combined dynamic schema const liveSchema = z.object({ title: z.string().min(1, "Title is required"), subject: z.enum(["physics", "chemistry", "botany", "zoology"]), lectureUrl: z.string().regex( /^https://live-server.dev-boi.xyz/, "Live link must start with https://live-server.dev-boi.xyz" ), });

const recordedSchema = z.object({ title: z.string().min(1, "Title is required"), subject: z.enum(["physics", "chemistry", "botany", "zoology"]), youtubeUrl: z.string().regex( /^https://youtu.be/[A-Za-z0-9_-]+$/, "YouTube link must be youtu.be format" ), });

export default function AddLectureModal({ isOpen, onClose }: AddLectureModalProps) { const [lectureType, setLectureType] = useState<LectureType>("live"); const { toast } = useToast(); const queryClient = useQueryClient();

// Single useForm with dynamic resolver const form = useForm({ resolver: zodResolver(lectureType === "live" ? liveSchema : recordedSchema), defaultValues: { title: "", subject: undefined, lectureUrl: "", youtubeUrl: "", } as any, });

useEffect(() => { form.reset(); }, [lectureType]);

const liveMutation = useMutation({ mutationFn: (data: z.infer<typeof liveSchema>) => apiRequest("POST", "/api/live-lectures", data).then((r) => r.json()), onSuccess: () => { queryClient.invalidateQueries(["/api/live-lectures"]); toast({ title: "Success", description: "Live lecture added" }); onClose(); }, });

const recordedMutation = useMutation({ mutationFn: (data: z.infer<typeof recordedSchema>) => apiRequest("POST", "/api/recorded-lectures", data).then((r) => r.json()), onSuccess: () => { queryClient.invalidateQueries(["/api/recorded-lectures"]); toast({ title: "Success", description: "Recorded lecture added" }); onClose(); }, });

const onSubmit = form.handleSubmit((data) => { if (lectureType === "live") liveMutation.mutate(data as any); else recordedMutation.mutate(data as any); });

return ( <Dialog open={isOpen} onOpenChange={onClose}> <DialogContent className="max-w-md"> <DialogHeader> <DialogTitle>Add New Lecture</DialogTitle> </DialogHeader>

<div className="mb-4">
      <FormLabel>Lecture Type</FormLabel>
      <Select value={lectureType} onValueChange={setLectureType}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="live">Live Lecture</SelectItem>
          <SelectItem value="recorded">Recorded Lecture</SelectItem>
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
                <Input {...field} placeholder="Enter lecture title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional URL Field */}
        {lectureType === "live" ? (
          <FormField
            control={form.control}
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
        ) : (
          <FormField
            control={form.control}
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
        )}

        {/* Subject */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
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

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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

); }

