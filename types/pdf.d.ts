// Type definitions for PDF.js
declare global {
  interface Window {
    pdfjsLib: {
      getDocument: (params: { data: ArrayBuffer } | string) => { promise: Promise<any> }
      GlobalWorkerOptions: {
        workerSrc: string
      }
      version: string
    }
  }
}

export {}
