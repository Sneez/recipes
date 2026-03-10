import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { ApiProvider } from "@/lib/api-context";
import { router } from "./router";
import "./globals.css";

const PUBLISHABLE_KEY = import.meta.env["VITE_CLERK_PUBLISHABLE_KEY"] as string;
if (!PUBLISHABLE_KEY) throw new Error("VITE_CLERK_PUBLISHABLE_KEY is required");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <SignedIn>
        <QueryClientProvider client={queryClient}>
          <ApiProvider>
            <RouterProvider router={router} />
          </ApiProvider>
        </QueryClientProvider>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  </React.StrictMode>,
);
