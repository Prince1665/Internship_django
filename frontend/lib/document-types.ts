export type DocumentUploadType =
  | 'PDF Document'
  | 'Excel Spreadsheet'
  | 'PowerPoint Presentation'
  | 'Word Document'
  | 'Image'
  | 'CSV File';

export type DocumentIcon = 'file' | 'spreadsheet' | 'presentation' | 'image' | 'csv';

type DocumentTypeDefinition = {
  label: DocumentUploadType;
  icon: DocumentIcon;
  mimeType: string;
  extensions: string[];
};

const documentTypeDefinitions: DocumentTypeDefinition[] = [
  {
    label: 'PDF Document',
    icon: 'file',
    mimeType: 'application/pdf',
    extensions: ['.pdf'],
  },
  {
    label: 'Excel Spreadsheet',
    icon: 'spreadsheet',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['.xls', '.xlsx', '.xlsm'],
  },
  {
    label: 'PowerPoint Presentation',
    icon: 'presentation',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['.ppt', '.pptx'],
  },
  {
    label: 'Word Document',
    icon: 'file',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.doc', '.docx'],
  },
  {
    label: 'Image',
    icon: 'image',
    mimeType: 'image/jpeg',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
  },
  {
    label: 'CSV File',
    icon: 'csv',
    mimeType: 'text/csv',
    extensions: ['.csv'],
  },
];

export const acceptedDocumentExtensions = documentTypeDefinitions.flatMap((definition) => definition.extensions);

export function getDocumentTypeFromFileName(fileName: string): DocumentUploadType | null {
  const lowerName = fileName.toLowerCase();
  const match = documentTypeDefinitions.find((definition) =>
    definition.extensions.some((extension) => lowerName.endsWith(extension))
  );
  return match?.label ?? null;
}

export function isSupportedDocumentFile(fileName: string) {
  return getDocumentTypeFromFileName(fileName) !== null;
}

export function getDocumentTypeDefinition(type: DocumentUploadType) {
  return documentTypeDefinitions.find((definition) => definition.label === type) ?? null;
}
