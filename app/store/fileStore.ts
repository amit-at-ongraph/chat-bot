import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface FileState {
  selectedFileNames: string[];
  toggleFile: (fileName: string) => void;
  setSelectedFiles: (fileNames: string[]) => void;
  addFile: (fileName: string) => void;
  clearSelection: () => void;
}

export const useFileStore = create<FileState>()(
  persist(
    immer((set) => ({
      selectedFileNames: [],
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
    })),
    {
      name: "file-selection-storage",
    },
  ),
);
