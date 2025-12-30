"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function WorkOrderListener() {
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    // Listen for the specific event
    socket.on("work-order:created", (data: { message: string }) => {
      // 1. Show a nice notification
      toast.success(data.message || "New Work Order Created");
      
      // 2. Refresh the server data without reloading the page
      router.refresh();
    });

    return () => {
      socket.off("work-order:created");
    };
  }, [socket, router]);

  return null; // This component renders nothing visually
}
