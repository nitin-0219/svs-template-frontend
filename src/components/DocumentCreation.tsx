import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Template, DocumentCreationPayload } from "@/types/template";

const formSchema = z.object({
  templateId: z.string({
    required_error: "Please select a template",
  }),
  signers: z
    .array(
      z.object({
        signerId: z.string().min(1, "Signer ID is required"),
        signerName: z.string().min(1, "Signer name is required"),
        signerEmail: z.string().email("Invalid email address"),
      }),
    )
    .min(1, "At least one signer is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function DocumentCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([
    // Mock data - replace with actual API call
    { id: "template-1", name: "Invoice Template" },
    { id: "template-2", name: "Contract Template" },
    { id: "template-3", name: "NDA Template" },
  ]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: "",
      signers: [{ signerId: "signer-1", signerName: "", signerEmail: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "signers",
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      // Replace with actual API endpoint
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data as DocumentCreationPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to create document");
      }

      const result = await response.json();

      toast({
        title: "Document created successfully",
        description: `Document ID: ${result.documentId}`,
      });

      // Reset form or redirect
      form.reset();
    } catch (error) {
      toast({
        title: "Error creating document",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch templates from backend
  // useEffect(() => {
  //   async function fetchTemplates() {
  //     try {
  //       const response = await fetch("/api/templates");
  //       if (!response.ok) throw new Error("Failed to fetch templates");
  //       const data = await response.json();
  //       setTemplates(data);
  //     } catch (error) {
  //       console.error("Error fetching templates:", error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to load templates",
  //         variant: "destructive",
  //       });
  //     }
  //   }
  //   fetchTemplates();
  // }, [toast]);

  return (
    <div className="container mx-auto py-10 bg-white">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Create Document</CardTitle>
          <CardDescription>
            Select a template and add signers to create a new document for
            signing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the template you want to use for this document.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Signers</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      append({
                        signerId: `signer-${fields.length + 1}`,
                        signerName: "",
                        signerEmail: "",
                      });
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Signer
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-md bg-muted/20"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Signer {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`signers.${index}.signerId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Signer ID</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`signers.${index}.signerName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`signers.${index}.signerEmail`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <CardFooter className="flex justify-end px-0">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 px-6"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Create Document
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
