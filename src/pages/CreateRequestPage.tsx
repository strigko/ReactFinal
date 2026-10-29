import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../api/axios";
import { getCategories, getPriorities } from "../api/requestsApi";
import { useToast } from "../context/ToastContext";

const requestSchema = z.object({
  title: z.string().min(3, "Title must contain at least 3 characters."),
  description: z.string().min(10, "Description must contain at least 10 characters."),
  categoryId: z.string().min(1, "Please select a category."),
  priorityId: z.string().min(1, "Please select a priority."),
  contactName: z.string().min(2, "Please enter your name."),
  contactEmail: z.string().email("Please enter a valid email."),
  contactPhone: z.string().min(5, "Please enter a valid phone number."),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const prioritiesQuery = useQuery({
    queryKey: ["priorities"],
    queryFn: getPriorities,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      priorityId: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await api.post("/requests", data);
      return response.data;
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["requests"] });
      showToast("Request created successfully!", "success");
      navigate(`/requests/${result.id}`);
    },
    onError: () => {
      showToast("Could not create the request. Please try again.", "error");
    },
  });

  function onSubmit(data: RequestFormData) {
    createMutation.mutate(data);
  }

  const isLoading = categoriesQuery.isPending || prioritiesQuery.isPending;
  const hasError = categoriesQuery.isError || prioritiesQuery.isError;

  return (
    <div className="pageContent">
      <div className="pageHeader">
        <div>
          <h1>Create a request</h1>
          <p className="muted">
            Describe your problem and we'll help you resolve it.
          </p>
        </div>
      </div>

      {isLoading && <div className="stateBox">Loading form options...</div>}

      {hasError && (
        <div className="stateBox errorBox">
          <h2>Couldn't load form options</h2>
          <p>Please try refreshing the page.</p>
          <button
            className="button primary"
            onClick={() => {
              categoriesQuery.refetch();
              prioritiesQuery.refetch();
            }}
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !hasError && (
        <form className="requestForm" onSubmit={handleSubmit(onSubmit)}>
          <div className="formSection">
            <h2>Request details</h2>
            <p className="muted">Tell us what you need help with.</p>

            <label htmlFor="title">Title</label>
            <input
              id="title"
              placeholder="For example: Laptop won't start"
              {...register("title")}
            />
            {errors.title && <p className="fieldError">{errors.title.message}</p>}

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={5}
              placeholder="Explain the problem in more detail..."
              {...register("description")}
            />
            {errors.description && (
              <p className="fieldError">{errors.description.message}</p>
            )}

            <div className="formGrid">
              <div className="formField">
                <label htmlFor="categoryId">Category</label>
                <select id="categoryId" {...register("categoryId")}>
                  <option value="">Select a category</option>
                  {categoriesQuery.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="fieldError">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="formField">
                <label htmlFor="priorityId">Priority</label>
                <select id="priorityId" {...register("priorityId")}>
                  <option value="">Select a priority</option>
                  {prioritiesQuery.data?.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
                {errors.priorityId && (
                  <p className="fieldError">{errors.priorityId.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="formSection">
            <h2>Contact information</h2>
            <p className="muted">How can the support team contact you?</p>

            <label htmlFor="contactName">Full name</label>
            <input
              id="contactName"
              placeholder="Your full name"
              {...register("contactName")}
            />
            {errors.contactName && (
              <p className="fieldError">{errors.contactName.message}</p>
            )}

            <label htmlFor="contactEmail">Email</label>
            <input
              id="contactEmail"
              type="email"
              placeholder="you@example.com"
              {...register("contactEmail")}
            />
            {errors.contactEmail && (
              <p className="fieldError">{errors.contactEmail.message}</p>
            )}

            <label htmlFor="contactPhone">Phone number</label>
            <input
              id="contactPhone"
              type="tel"
              placeholder="+380..."
              {...register("contactPhone")}
            />
            {errors.contactPhone && (
              <p className="fieldError">{errors.contactPhone.message}</p>
            )}
          </div>

          {createMutation.isError && (
            <p className="fieldError">
              The request could not be submitted. Please try again.
            </p>
          )}

          <div className="formActions">
            <button
              type="button"
              className="button secondary"
              onClick={() => navigate("/requests")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button primary"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Submit request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
