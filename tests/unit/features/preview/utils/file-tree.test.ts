import { describe, it, expect } from "vitest";

import { buildFileTree, getFilePath } from "../../../../../src/features/preview/utils/file-tree";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

type FileDoc = Doc<"files">;

const createMockFile = (
  id: string,
  name: string,
  type: "file" | "folder",
  parentId?: string,
  content?: string
): FileDoc => ({
  _id: id as Id<"files">,
  _creationTime: Date.now(),
  projectId: "project1" as Id<"projects">,
  parentId: parentId as Id<"files"> | undefined,
  name,
  type,
  content,
  updatedAt: Date.now(),
});

describe("file-tree utils", () => {
  describe("buildFileTree", () => {
    it("should build a nested tree from flat files", () => {
      const files: FileDoc[] = [
        createMockFile("1", "src", "folder"),
        createMockFile("2", "index.ts", "file", "1", "console.log('hello')"),
        createMockFile("3", "package.json", "file", undefined, "{}"),
      ];

      const tree = buildFileTree(files);

      expect(tree).toEqual({
        src: {
          directory: {
            "index.ts": {
              file: { contents: "console.log('hello')" },
            },
          },
        },
        "package.json": {
          file: { contents: "{}" },
        },
      });
    });

    it("should handle deeply nested directories", () => {
      const files: FileDoc[] = [
        createMockFile("1", "a", "folder"),
        createMockFile("2", "b", "folder", "1"),
        createMockFile("3", "c.txt", "file", "2", "deeply nested"),
      ];

      const tree = buildFileTree(files);

      expect(tree).toEqual({
        a: {
          directory: {
            b: {
              directory: {
                "c.txt": {
                  file: { contents: "deeply nested" },
                },
              },
            },
          },
        },
      });
    });

    it("should return empty tree for no files", () => {
      expect(buildFileTree([])).toEqual({});
    });
  });

  describe("getFilePath", () => {
    it("should get the full path for a file", () => {
      const f1 = createMockFile("1", "src", "folder");
      const f2 = createMockFile("2", "index.ts", "file", "1");
      const filesMap = new Map<Id<"files">, FileDoc>([
        [f1._id, f1],
        [f2._id, f2],
      ]);

      expect(getFilePath(f2, filesMap)).toBe("src/index.ts");
    });

    it("should get the path for a top-level file", () => {
      const f1 = createMockFile("1", "README.md", "file");
      const filesMap = new Map<Id<"files">, FileDoc>([[f1._id, f1]]);

      expect(getFilePath(f1, filesMap)).toBe("README.md");
    });
  });
});
