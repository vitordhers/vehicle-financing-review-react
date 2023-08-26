import { Document, View } from "@react-pdf/renderer";

// Create Document Component
export const PdfDocumentConverter = (pages: (JSX.Element | undefined)[]) => (
  <Document>
    {pages
      .filter((p) => !!p)
      .map((p) => (
        <View>{p}</View>
      ))}
  </Document>
);
