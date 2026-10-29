import { delay, http, HttpResponse } from "msw";
import {
  users,
  categories,
  priorities,
  statuses,
  requests,
  comments,
  history,
} from "./data";
import type {
  User,
  ServiceRequest,
  RequestComment,
  StatusHistory,
} from "../types";

const tokens: Record<string, string> = {};

function publicUser(user: User) {
  const { password, ...safeUser } = user;
  return safeUser;
}


function getUser(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.substring(7);
  const userId = token.replace("mock-token-", "");

  return users.find((user) => user.id === userId) ?? null;
}



function unauthorized() {
  return HttpResponse.json(
    { message: "Unauthorized" },
    { status: 401 }
  );
}

function forbidden() {
  return HttpResponse.json(
    { message: "Forbidden" },
    { status: 403 }
  );
}

export const handlers = [
  // Authentication

  http.post("/auth/login", async ({ request }) => {
    const body = await request.json() as {
      email: string;
      password: string;
    };

    const user = users.find(
      (item) =>
        item.email === body.email &&
        item.password === body.password
    );

    if (!user) {
      return HttpResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const accessToken = `mock-token-${user.id}`;
    tokens[accessToken] = user.id;

    return HttpResponse.json({
      accessToken,
      user: publicUser(user),
    });
  }),

  http.get("/auth/me", ({ request }) => {
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    return HttpResponse.json(publicUser(user));
  }),

  // Categories, priorities and statuses

  http.get("/categories", ({ request }) => {
    if (!getUser(request)) {
      return unauthorized();
    }

    return HttpResponse.json(categories);
  }),

  http.get("/priorities", ({ request }) => {
    if (!getUser(request)) {
      return unauthorized();
    }

    return HttpResponse.json(priorities);
  }),

  http.get("/request-statuses", ({ request }) => {
    if (!getUser(request)) {
      return unauthorized();
    }

    return HttpResponse.json(statuses);
  }),

  // Current user's requests

  http.get("/requests/my", async ({ request }) => {
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    await delay(800);

    return HttpResponse.json(
      requests.filter((item) => item.userId === user.id)
    );
  }),

  // All requests (operators only)

  http.get("/requests", async ({ request }) => {
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "operator") {
      return forbidden();
    }

    const url = new URL(request.url);
    const simulation = url.searchParams.get("simulate");

    if (simulation === "500") {
      return HttpResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }

    if (simulation === "network") {
      return HttpResponse.error();
    }

    await delay(800);

    const statusId = url.searchParams.get("status");

    const filteredRequests = statusId
      ? requests.filter((item) => item.statusId === statusId)
      : requests;

    return HttpResponse.json(filteredRequests);
  }),

  // Get one request

  http.get("/requests/:id", ({ request, params }) => {
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    const item = requests.find(
      (requestItem) => requestItem.id === String(params.id)
    );

    if (!item) {
      return HttpResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    if (user.role !== "operator" && item.userId !== user.id) {
      return forbidden();
    }

    return HttpResponse.json(item);
  }),

  // Create a request

  http.post("/requests", async ({ request }) => {
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "user") {
      return forbidden();
    }

    const body = await request.json() as Omit<
      ServiceRequest,
      "id" | "userId" | "statusId" | "createdAt"
    >;

    if (
      !body.title?.trim() ||
      !body.description?.trim() ||
      !body.categoryId ||
      !body.priorityId ||
      !body.contactName?.trim() ||
      !body.contactEmail?.trim() ||
      !body.contactPhone?.trim()
    ) {
      return HttpResponse.json(
        { message: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const newRequest: ServiceRequest = {
      id: String(Date.now()),
      title: body.title.trim(),
      description: body.description.trim(),
      categoryId: body.categoryId,
      priorityId: body.priorityId,
      statusId: "1",
      userId: user.id,
      contactName: body.contactName.trim(),
      contactEmail: body.contactEmail.trim(),
      contactPhone: body.contactPhone.trim(),
      createdAt: new Date().toISOString(),
    };

    requests.push(newRequest);

    return HttpResponse.json(newRequest, { status: 201 });
  }),

  // Update request status (operators only)

  http.patch("/requests/:id/status", async ({ request, params }) => {
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "operator") {
      return forbidden();
    }

    const item = requests.find(
      (requestItem) => requestItem.id === String(params.id)
    );

    if (!item) {
      return HttpResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    const body = await request.json() as { statusId: string };

    const newStatus = statuses.find(
      (status) => status.id === body.statusId
    );

    if (!newStatus) {
      return HttpResponse.json(
        { message: "Invalid status" },
        { status: 400 }
      );
    }

    const oldStatus = statuses.find(
      (status) => status.id === item.statusId
    );

    if (item.statusId !== newStatus.id) {
      const newHistory: StatusHistory = {
        id: String(Date.now()),
        requestId: item.id,
        oldStatus: oldStatus?.name ?? item.statusId,
        newStatus: newStatus.name,
        changedBy: user.name,
        createdAt: new Date().toISOString(),
      };

      history.push(newHistory);
      item.statusId = newStatus.id;
    }

    return HttpResponse.json(item);
  }),

  // Get comments for a request

  http.get("/requests/:id/comments", ({ request, params }) => {
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    const item = requests.find(
      (requestItem) => requestItem.id === String(params.id)
    );

    if (!item) {
      return HttpResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    if (user.role !== "operator" && item.userId !== user.id) {
      return forbidden();
    }

    return HttpResponse.json(
      comments.filter((comment) => comment.requestId === item.id)
    );
  }),

  // Add a comment (operators only)

  http.post("/requests/:id/comments", async ({ request, params }) => {
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    if (user.role !== "operator") {
      return forbidden();
    }

    const item = requests.find(
      (requestItem) => requestItem.id === String(params.id)
    );

    if (!item) {
      return HttpResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    const body = await request.json() as { text: string };

    if (!body.text?.trim()) {
      return HttpResponse.json(
        { message: "Comment cannot be empty" },
        { status: 400 }
      );
    }

    const newComment: RequestComment = {
      id: String(Date.now()),
      requestId: item.id,
      userId: user.id,
      userName: user.name,
      text: body.text.trim(),
      createdAt: new Date().toISOString(),
    };

    comments.push(newComment);

    return HttpResponse.json(newComment, { status: 201 });
  }),

  // Get status history

  http.get("/requests/:id/history", ({ request, params }) => {
    const user = getUser(request);

    if (!user) {
      return unauthorized();
    }

    const item = requests.find(
      (requestItem) => requestItem.id === String(params.id)
    );

    if (!item) {
      return HttpResponse.json(
        { message: "Request not found" },
        { status: 404 }
      );
    }

    if (user.role !== "operator" && item.userId !== user.id) {
      return forbidden();
    }

    return HttpResponse.json(
      history.filter((entry) => entry.requestId === item.id)
    );
  }),
];
