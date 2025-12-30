"use client";

import { updateWorkOrderStatus } from "@/actions/work-orders";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OrderActionsProps {
  id: string;
  status: string;
}

export function OrderActions({ id, status }: OrderActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: "IN_PROGRESS" | "COMPLETED") => {
    try {
      setIsLoading(true);
      await updateWorkOrderStatus(id, newStatus);
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "COMPLETED") {
    return <div className="text-green-600 flex items-center text-sm font-medium"><CheckCircle className="w-4 h-4 mr-1"/> Done</div>;
  }

  if (status === "IN_PROGRESS") {
    return (
      <Button 
        size="sm" 
        variant="outline" 
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={() => handleStatusChange("COMPLETED")}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
        Complete
      </Button>
    );
  }

  return (
    <Button 
      size="sm" 
      variant="default"
      onClick={() => handleStatusChange("IN_PROGRESS")}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
      Start
    </Button>
  );
}
