import "@testing-library/jest-dom";
import { TransformStream } from "node:stream/web";

// Polyfill TransformStream for jsdom (used by some dependencies)
if (typeof globalThis.TransformStream === "undefined") {
   
  globalThis.TransformStream = TransformStream as any;
}
