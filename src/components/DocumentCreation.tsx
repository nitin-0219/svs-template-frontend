import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Trash2, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { justCreated, templateName } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: "",
      signers: [{ signerId: "", signerName: "", signerEmail: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "signers",
  });

  const handleSuccessfulCreation = () => {
    toast({
      title: "Success!",
      description: "Document created successfully and sent to signers",
      variant: "default",
    });

    // Show navigation options in a separate toast
    toast({
      title: "What would you like to do next?",
      description: "You can create another document or create a new template.",
      action: (
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              form.reset();
              form.setValue("signers", [
                { signerId: "", signerName: "", signerEmail: "" },
              ]);
            }}
          >
            New Document
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
          >
            New Template
          </Button>
        </div>
      ),
      duration: 10000, // 10 seconds
    });
  };

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8081/Doc/create-Doc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: data.templateId,
          signers: data.signers.map((signer) => ({
            signerId: signer.signerId,
            signerName: signer.signerName,
            signerEmail: signer.signerEmail,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create document");
      }

      const result = await response.json();

      handleSuccessfulCreation();
    } catch (error) {
      console.error("Document creation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch(
          "http://localhost:8081/Template/get-active-templates",
        );
        if (!response.ok) throw new Error("Failed to fetch templates");
        const data: Template[] = await response.json();

        // Sort templates by createdAt in descending order (newest first)
        const sortedTemplates = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setTemplates(sortedTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    fetchTemplates();
  }, [toast]);

  useEffect(() => {
    if (justCreated && templateName) {
      toast({
        title: "Template Ready!",
        description: `Your template "${templateName}" is now available for use.`,
        variant: "default",
        duration: 5000,
      });
    }
  }, [justCreated, templateName, toast]);

  const formatTemplateName = (name: string) => {
    const normalizedName = name.trim();
    // If already contains 'template', return as is
    if (normalizedName.toLowerCase().includes("template")) {
      return normalizedName;
    }

    // Check if contains 'form'
    const hasForm = normalizedName.toLowerCase().includes("form");

    // Add appropriate suffix based on whether it contains 'form'
    if (hasForm) {
      return `${normalizedName} Template`;
    }
    return `${normalizedName} Form Template`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="container px-4">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Create Document
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your templates into signable documents. Add signers and manage your document workflow seamlessly.
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="max-w-4xl mx-auto backdrop-blur-sm bg-white/90 shadow-xl border-t border-blue-100">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Template Selection Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-full bg-blue-100 mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Select Template</h2>
                  </div>
                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoadingTemplates}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 bg-white">
                              <SelectValue
                                placeholder={
                                  isLoadingTemplates
                                    ? "Loading templates..."
                                    : "Choose a template to get started"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templates.map((template) => (
                              <SelectItem
                                key={template.templateId}
                                value={template.templateId}
                                className="py-3 cursor-pointer hover:bg-blue-50"
                              >
                                {formatTemplateName(template.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Signers Section */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-100 mr-3">
                        <PlusCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800">Document Signers</h2>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ signerId: `signer-${fields.length + 1}`, signerName: "", signerEmail: "" })}
                      className="bg-white hover:bg-blue-50 border-blue-200"
                    >
                      <PlusCircle className="h-4 w-4 mr-2 text-blue-600" />
                      Add Signer
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-6 rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-700">
                            Signer {index + 1}
                          </h3>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Signer Fields Grid */}
                        <div className="grid gap-6 md:grid-cols-3">
                          <FormField
                            control={form.control}
                            name={`signers.${index}.signerId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Signer ID</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter signer ID" />
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
                                <FormLabel>Signer Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter signer name" />
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
                                <FormLabel>Signer Email</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter signer email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 px-8 py-3 text-lg shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Creating Document...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-2" />
                        Create Document
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

