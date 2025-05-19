import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar, FileText, PenTool, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "./ui/use-toast";
import FileUploader from "./FileUploader";
import JsonInputField from "./JsonInputField";
import PdfEditor from "./PdfEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";

const formSchema = z
  .object({
    templateName: z.string().min(1, { message: "Template name is required" }),
    validFrom: z.date(), // Remove validation requirements
    validTo: z
      .date({ required_error: "Valid to date and time is required" })
      .refine((date) => {
        const now = new Date();
        return date >= now;
      }, "Valid to date must be in the future"),
    pdfFile: z
      .instanceof(File, { message: "PDF file is required" })
      .refine((file) => file.type === "application/pdf", {
        message: "File must be a PDF",
      }),
    config: z
      .string()
      .min(1, { message: "Config JSON is required" })
      .refine(
        (val) => {
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Config must be valid JSON" },
      ),
    fabric: z
      .string()
      .min(1, { message: "Fabric JSON is required" })
      .refine(
        (val) => {
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Fabric must be valid JSON" },
      ),
  })
  .refine((data) => {
    const validTo = new Date(data.validTo);
    const now = new Date();
    const minDiff = 1000 * 60 * 5; // 5 minutes minimum difference
    return validTo.getTime() - now.getTime() >= minDiff;
  }, {
    message: "Valid to date must be at least 5 minutes from now",
    path: ["validTo"],
  });

type FormValues = z.infer<typeof formSchema>;

export function TemplateForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "editor">("details");
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const { toast } = useToast();

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(tomorrow.getHours() + 24);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateName: "",
      config: "",
      fabric: "",
      validFrom: now,
      validTo: tomorrow,
    },
  });

  const getCurrentDateTime = () => {
    const now = new Date();
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  const formatDisplayDateTime = (date: Date) => {
    return format(date, "PPP 'at' p");
  };

  const getFormDate = (field: 'validFrom' | 'validTo'): Date => {
    const value = form.getValues(field);
    return value || new Date();
  };

  const handleSuccessfulCreation = (templateName: string) => {
    toast({
      title: "Success!",
      description: "Template created successfully",
      variant: "default",
    });

    toast({
      title: "What would you like to do next?",
      description:
        "You can create a document using this template or create another template.",
      action: (
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate("/create-document", {
                state: { justCreated: true, templateName },
              })
            }
          >
            Create Document
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              form.reset();
              setActiveTab("details");
              setUploadedPdfFile(null);
            }}
          >
            New Template
          </Button>
        </div>
      ),
      duration: 10000,
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setShowDateDialog(false);

    try {
      const configBase64 = btoa(data.config);
      const fabricBase64 = btoa(data.fabric);

      const formatDate = (date: Date) => {
        return format(date, "yyyy-MM-dd HH:mm:ss");
      };

      const formData = new FormData();
      formData.append("templateName", data.templateName);
      formData.append("validFrom", formatDate(data.validFrom));
      formData.append("validTo", formatDate(data.validTo));
      formData.append("mainFile", data.pdfFile);
      formData.append("config", configBase64);
      formData.append("fabric", fabricBase64);

      const response = await fetch(
        "http://localhost:8081/Template/create-template",
        {
          method: "POST",
          body: formData,
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        if (
          response.status === 409 ||
          responseData.message?.includes("already exists")
        ) {
          form.setError("templateName", {
            type: "manual",
            message:
              "A template with this name already exists. Please choose a different name.",
          });
          toast({
            title: "Template Name Error",
            description:
              "A template with this name already exists. Please choose a different name.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(responseData.message || `Error: ${response.status}`);
      }

      handleSuccessfulCreation(data.templateName);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePdfEditorSave = (configJson: string, fabricJson: string) => {
    form.setValue("config", configJson);
    form.setValue("fabric", fabricJson);
    setActiveTab("details");
    toast({
      title: "Template Configured",
      description: "Template fields have been configured successfully",
      variant: "default",
    });
  };

  const handlePdfFileUpload = (file: File | null) => {
    if (file) {
      form.setValue("pdfFile", file);
      setUploadedPdfFile(file);
      setActiveTab("editor");
    } else {
      form.setValue("pdfFile", null as any);
      setUploadedPdfFile(null);
    }
  };

  const handleSubmitClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDateDialog(true);
  };

  const handleDateSubmit = () => {
    const validTo = form.getValues().validTo;

    if (!validTo) {
      toast({
        title: "Error",
        description: "Please select an end date",
        variant: "destructive",
      });
      return;
    }

    setShowDateDialog(false);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="relative w-full">
      <div className="container mx-auto">
        <Card className="w-full max-w-4xl mx-auto bg-white/95 shadow-xl">
          <CardContent className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "details" | "editor")}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2 bg-blue-50/50 p-1 rounded-lg">
                <TabsTrigger 
                  value="details"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Template Details
                </TabsTrigger>
                <TabsTrigger 
                  value="editor"
                  disabled={!uploadedPdfFile}
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  PDF Editor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Form {...form}>
                  <form className="space-y-8">
                    {/* Template Name Section */}
                    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-6 rounded-xl border border-blue-100">
                      <FormField
                        control={form.control}
                        name="templateName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-medium text-gray-700">Template Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter a descriptive name for your template" 
                                className="bg-white/80"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              This name will be used to identify your template
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* PDF Upload Section */}
                    <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-6 rounded-xl border border-gray-200">
                      <FormField
                        control={form.control}
                        name="pdfFile"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-medium text-gray-700">Upload PDF</FormLabel>
                            <FormControl>
                              <FileUploader
                                onFileChange={handlePdfFileUpload}
                                acceptedFileTypes="application/pdf"
                                maxSize={10 * 1024 * 1024}
                                selectedFile={value as File}
                              />
                            </FormControl>
                            <FormDescription>
                              Select a PDF file to use as your template base (Max: 10MB)
                              {uploadedPdfFile && (
                                <p className="mt-2 text-sm text-blue-600">
                                  ✓ PDF uploaded successfully. Switch to PDF Editor tab to add fields
                                </p>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={handleSubmitClick}
                        disabled={!form.getValues().pdfFile || isSubmitting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {uploadedPdfFile ? 'Continue to Set Validity' : 'Upload PDF First'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="editor" className="min-h-[600px] border rounded-xl p-4">
                {uploadedPdfFile ? (
                  <PdfEditor
                    pdfFile={uploadedPdfFile}
                    onSave={handlePdfEditorSave}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Please upload a PDF file first
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Date Dialog */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Set Template Validity Period
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Valid From Field - Optional */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-500">Start Time (Optional)</Label>
              <Input
                type="datetime-local"
                defaultValue={format(getFormDate('validFrom'), "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => {
                  form.setValue("validFrom", new Date(e.target.value));
                }}
                className="w-full"
              />
            </div>

            {/* Valid To Field - Required */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold text-gray-700">End Time (Required)</Label>
              <Input
                type="datetime-local"
                defaultValue={format(getFormDate('validTo'), "yyyy-MM-dd'T'HH:mm")}
                min={getCurrentDateTime()}
                onChange={(e) => {
                  form.setValue("validTo", new Date(e.target.value));
                }}
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">Must be at least 5 minutes in the future</p>
            </div>

            {/* Duration Display */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                Template will expire on {format(getFormDate('validTo'), "PPp")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDateSubmit}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
