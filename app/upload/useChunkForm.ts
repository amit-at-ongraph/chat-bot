"use client";

import { ApplicableRole } from "@/lib/constants";
import { useCallback, useState } from "react";
import { MetadataState } from "./types";

export function useChunkForm(initialMetadata: MetadataState) {
  const [metadata, setMetadata] = useState<MetadataState>(initialMetadata);
  const [content, setContent] = useState("");

  const handleMetadataChange = useCallback(<K extends keyof MetadataState>(key: K, value: MetadataState[K]) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleRoleToggle = useCallback((role: ApplicableRole) => {
    setMetadata((prev) => ({
      ...prev,
      applicableRoles: prev.applicableRoles.includes(role)
        ? prev.applicableRoles.filter((r) => r !== role)
        : [...prev.applicableRoles, role],
    }));
  }, []);

  return {
    metadata,
    setMetadata,
    content,
    setContent,
    handleMetadataChange,
    handleRoleToggle,
  };
}
