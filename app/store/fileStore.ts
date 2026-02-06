import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface FileState {
  selectedFileNames: string[];
  isUploadDialogOpen: boolean;
  toggleFile: (fileName: string) => void;
  setSelectedFiles: (fileNames: string[]) => void;
  addFile: (fileName: string) => void;
  clearSelection: () => void;
  setUploadDialogOpen: (open: boolean) => void;
}

export const useFileStore = create<FileState>()(
  immer((set) => ({
    selectedFileNames: [],
    isUploadDialogOpen: false,
    toggleFile: (fileName) =>
      set((state) => {
        const index = state.selectedFileNames.indexOf(fileName);
        if (index > -1) {
          state.selectedFileNames.splice(index, 1);
        } else {
          state.selectedFileNames.push(fileName);
        }
      }),
    setSelectedFiles: (fileNames) =>
      set((state) => {
        state.selectedFileNames = fileNames;
      }),
    addFile: (fileName) =>
      set((state) => {
        if (!state.selectedFileNames.includes(fileName)) {
          state.selectedFileNames.push(fileName);
        }
      }),
    clearSelection: () =>
      set((state) => {
        state.selectedFileNames = [];
      }),
    setUploadDialogOpen: (open) =>
      set((state) => {
        state.isUploadDialogOpen = open;
      }),
  })),
);
