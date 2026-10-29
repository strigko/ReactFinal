import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  addRequestComment,
  getCategories,
  getPriorities,
  getRequestById,
  getRequestComments,
  getRequestHistory,
  getRequestStatuses,
  updateRequestStatus,
} from "../api/requestsApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const requestQuery = useQuery({
    queryKey: ["request", id],
    queryFn: () => getRequestById(id!),
    enabled: !!id,
  });

  const commentsQuery = useQuery({
    queryKey: ["requestComments", id],
    queryFn: () => getRequestComments(id!),
    enabled: !!id,
  });

  const historyQuery = useQuery({
    queryKey: ["requestHistory", id],
    queryFn: () => getRequestHistory(id!),
    enabled: !!id,
  });

  const statusesQuery = useQuery({
    queryKey: ["requestStatuses"],
    queryFn: getRequestStatuses,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const prioritiesQuery = useQuery({
    queryKey: ["priorities"],
    queryFn: getPriorities,
  });

  const request = requestQuery.data;
  const statuses = statusesQuery.data ?? [];

  const currentStatus = statuses.find(
    (status) => status.id === request?.statusId
  );

  const category = categoriesQuery.data?.find(
    (item) => item.id === request?.categoryId
  );

  const priority = prioritiesQuery.data?.find(
    (item) => item.id === request?.priorityId
  );

  const statusMutation = useMutation({
    mutationFn: (statusId: string) =>
      updateRequestStatus(id!, statusId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["request", id] }),
        queryClient.invalidateQueries({ queryKey: ["requests"] }),
        queryClient.invalidateQueries({ queryKey: ["requestHistory", id] }),
      ]);
      showToast("Request status updated!", "success");
    },
    onError: () => {
      showToast("Could not update the status.", "error");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) => addRequestComment(id!, text),
    onSuccess: async () => {
      setCommentText("");
      await queryClient.invalidateQueries({
        queryKey: ["requestComments", id],
      });
      showToast("Comment added!", "success");
    },
    onError: () => {
      showToast("Could not add the comment.", "error");
    },
  });

  if (requestQuery.isPending) {
    return (
      <div className="pageContent">
        <div className="stateBox">Loading request details...</div>
      </div>
    );
  }

  if (requestQuery.isError || !request) {
    return (
      <div className="pageContent">
        <div className="stateBox errorBox">
          <h2>Couldn't load this request</h2>
          <p>It may not exist, or you may not have permission to view it.</p>
          <Link to="/requests" className="button primary">
            Back to requests
          </Link>
        </div>
      </div>
    );
  }

function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = commentText.trim();

    if (text.length < 2) {
      showToast("A comment must contain at least 2 characters.", "error");
      return;
    }

    commentMutation.mutate(text);
  }

  return (
    <div className="pageContent">
      <Link to="/requests" className="backLink">
        ← Back to requests
      </Link>

      <div className="detailsHeader">
        <div>
          <span className="requestId">Request #{request.id}</span>
          <h1>{request.title}</h1>
          <p className="muted">
            Created {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>

        <span className={`statusBadge status${request.statusId}`}>
          {currentStatus?.name ?? "Unknown status"}
        </span>
      </div>

      <div className="detailsGrid">
        <section className="detailsCard">
          <h2>Request information</h2>

          <div className="detailItem">
            <span>Description</span>
            <p>{request.description}</p>
          </div>

          <div className="detailColumns">
            <div className="detailItem">
              <span>Category</span>
              <p>{category?.name ?? "Loading..."}</p>
            </div>

            <div className="detailItem">
              <span>Priority</span>
              <p>{priority?.name ?? "Loading..."}</p>
            </div>
          </div>

          <h2 className="sectionHeading">Contact information</h2>

          <div className="detailItem">
            <span>Name</span>
            <p>{request.contactName}</p>
          </div>

          <div className="detailItem">
            <span>Email</span>
            <p>{request.contactEmail}</p>
          </div>

          <div className="detailItem">
            <span>Phone</span>
            <p>{request.contactPhone}</p>
          </div>

          {user?.role === "operator" && (
            <div className="operatorControls">
              <h2>Manage request</h2>

              <label htmlFor="newStatus">Change status</label>
              <select
                id="newStatus"
                value={selectedStatus || request.statusId}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>

              <button
                className="button primary"
                disabled={
                  statusMutation.isPending ||
                  (selectedStatus || request.statusId) === request.statusId
                }
                onClick={() =>
                  statusMutation.mutate(selectedStatus || request.statusId)
                }
              >
                {statusMutation.isPending ? "Saving..." : "Update status"}
              </button>
            </div>
          )}
        </section>

        <div className="detailsSide">
          <section className="detailsCard">
            <h2>Status history</h2>

            {historyQuery.isPending && <p className="muted">Loading history...</p>}

            {historyQuery.isError && (
              <p className="fieldError">Couldn't load status history.</p>
            )}

            {!historyQuery.isPending &&
              !historyQuery.isError &&
              (historyQuery.data?.length ?? 0) === 0 && (
                <p className="muted">No status changes yet.</p>
              )}

            {historyQuery.data?.map((entry) => (
              <div className="historyItem" key={entry.id}>
                <div className="historyDot" />
                <div>
                  <strong>{entry.oldStatus} → {entry.newStatus}</strong>
                  <p>{entry.changedBy}</p>
                  <span>{new Date(entry.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="detailsCard">
            <h2>Comments</h2>

            {commentsQuery.isPending && <p className="muted">Loading comments...</p>}

            {commentsQuery.isError && (
              <p className="fieldError">Couldn't load comments.</p>
            )}

            {!commentsQuery.isPending &&
              !commentsQuery.isError &&
              (commentsQuery.data?.length ?? 0) === 0 && (
                <p className="muted">No comments yet.</p>
              )}

            {commentsQuery.data?.map((comment) => (
              <div className="commentItem" key={comment.id}>
                <div className="commentTop">
                  <strong>{comment.userName}</strong>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p>{comment.text}</p>
              </div>
            ))}

            {user?.role === "operator" && (
              <form className="commentForm" onSubmit={handleAddComment}>
                <label htmlFor="commentText">Add a comment</label>
                <textarea
                  id="commentText"
                  rows={3}
                  placeholder="Write a reply..."
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                />

                <button
                  type="submit"
                  className="button primary"
                  disabled={commentMutation.isPending}
                >
                  {commentMutation.isPending ? "Sending..." : "Send comment"}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
