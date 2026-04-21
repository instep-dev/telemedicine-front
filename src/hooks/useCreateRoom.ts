"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export const useCreateRoom = () => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = useCallback(async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      // Consultation creation is now admin-only.
      router.push("/doctor/schedule");
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, router]);

  return {
    handleCreateRoom,
    isCreating,
  };
};
