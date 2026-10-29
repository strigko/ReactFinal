import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { getAllRequests, getMyRequests, getRequestStatuses } from "../api/requestsApi";
import { useAuth } from "../context/AuthContext";

export default function RequestsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");

  const statusId = searchParams.get("status") || "";

  const requestsQuery = useQuery({
    queryKey: ["requests", user?.role, statusId],
    queryFn: () =>
      user?.role === "operator"
        ? getAllRequests(statusId || undefined)
        : getMyRequests(),
    enabled: !!user,
  });

  const statusesQuery = useQuery({
    queryKey: ["requestStatuses"],
    queryFn: getRequestStatuses,
  });

  const statuses = statusesQuery.data ?? [];

  const requests = (requestsQuery.data ?? []).filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(search.toLowerCase()) ||
      request.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusId || request.statusId === statusId;

    return matchesSearch && matchesStatus;
  });

  function changeStatus(value: string) {
    if (value) {
      setSearchParams({ status: value });
    } else {
      setSearchParams({});
    }
  }

  function getStatusName(id: string) {
    return statuses.find((status) => status.id === id)?.name ?? "Unknown";
  }

  return (
    <div className="pageContent">
      <div className="pageHeader">
        <div>
          <h1>{user?.role === "operator" ? "All requests" : "My requests"}</h1>
          <p className="muted">
            {user?.role === "operator"
              ? "View and manage service requests."
              : "Track the status of your service requests."}
          </p>
        </div>

        {user?.role === "user" && (
          <Link to="/requests/new" className="button primary createButton">
            + Create request
          </Link>
        )}
      </div>

      <div className="filterRow">
        <input
          type="text"
          placeholder="Search requests..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search requests"
        />

        <select
          value={statusId}
          onChange={(event) => changeStatus(event.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>

      {requestsQuery.isPending && (
        <div className="stateBox">
          <div className="spinner" />
          <p>Loading requests...</p>
        </div>
      )}

      {requestsQuery.isError && (
        <div className="stateBox errorBox">
          <h2>Couldn't load requests</h2>
          <p>Please check your connection and try again.</p>
          <button
            className="button primary"
            onClick={() => requestsQuery.refetch()}
          >
            Try again
          </button>
        </div>
      )}

      {!requestsQuery.isPending &&
        !requestsQuery.isError &&
        requests.length === 0 && (
          <div className="stateBox emptyState">
            <div className="emptyIcon">◇</div>
            <h2>No requests found</h2>
            <p>
              {search || statusId
                ? "Try changing your search or filter."
                : "There are no requests to display yet."}
            </p>
          </div>
        )}

      {!requestsQuery.isPending && !requestsQuery.isError && requests.length > 0 && (
        <>
          <p className="resultsCount">
            {requests.length} {requests.length === 1 ? "request" : "requests"}
          </p>

          <div className="requestList">
            {requests.map((request) => (
              <Link
                to={`/requests/${request.id}`}
                className="requestCard"
                key={request.id}
              >
                <div className="requestCardTop">
                  <span className="requestId">Request #{request.id}</span>
                  <span
                    className={`statusBadge status${request.statusId.replace(/\s/g, "")}`}
                  >
                    {getStatusName(request.statusId)}
                  </span>
                </div>

                <h2>{request.title}</h2>
                <p className="requestDescription">{request.description}</p>

                <div className="requestCardBottom">
                  <span>
                    Created{" "}
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  <span className="viewRequest">View details →</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
