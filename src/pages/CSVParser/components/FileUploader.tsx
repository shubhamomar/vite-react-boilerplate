import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useCSVParserStore } from '../stores/csvParserStore';
import { isValidCSVFile, formatFileSize, shouldUsePerformanceMode } from '../utils/helpers';

// Icons
import {
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon
} from 'lucide-react';

interface FileUploadResult {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  id: string;
}

interface FileUploaderProps {
  addSheet?: (file: File) => Promise<void>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ addSheet: addSheetProp }) => {
  const { addSheet: addSheetFromStore } = useCSVParserStore();
  const addSheet = addSheetProp || addSheetFromStore;
  const [uploadResults, setUploadResults] = useState<FileUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file drop/selection
  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      console.log('Rejected files:', rejectedFiles);
    }

    if (acceptedFiles.length === 0) return;

    setIsUploading(true);

    // Initialize upload results
    const initialResults: FileUploadResult[] = acceptedFiles.map(file => ({
      file,
      status: 'pending',
      id: `${file.name}-${file.size}-${file.lastModified}`,
    }));

    setUploadResults(initialResults);

    // Process each file
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const fileId = initialResults[i]?.id;

      if (!file || !fileId) continue;

      try {
        // Update status to uploading
        setUploadResults(prev => prev.map(result =>
          result.id === fileId
            ? { ...result, status: 'uploading' }
            : result
        ));

        // Validate file
        if (!isValidCSVFile(file)) {
          throw new Error('Invalid file type. Please upload a CSV file.');
        }

        // Add sheet to store (this will trigger parsing)
        await addSheet(file);

        // Update status to success
        setUploadResults(prev => prev.map(result =>
          result.id === fileId
            ? { ...result, status: 'success' }
            : result
        ));

      } catch (error) {
        // Update status to error
        setUploadResults(prev => prev.map(result =>
          result.id === fileId
            ? {
                ...result,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : result
        ));
      }
    }

    setIsUploading(false);

    // Clear results after 5 seconds if all successful
    setTimeout(() => {
      setUploadResults(prev => {
        const hasErrors = prev.some(result => result.status === 'error');
        return hasErrors ? prev : [];
      });
    }, 5000);

  }, [addSheet]);

  // Dropzone configuration
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt', '.tsv'],
      'application/csv': ['.csv'],
    },
    multiple: true,
    maxSize: 500 * 1024 * 1024, // 500MB max
    disabled: isUploading,
  });

  // Get dropzone styling
  const getDropzoneClassName = () => {
    let className = "relative group border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-m3-primary focus:ring-offset-2 ";

    if (isDragAccept) {
      className += "border-green-400 bg-green-50 text-green-700";
    } else if (isDragReject) {
      className += "border-red-400 bg-red-50 text-red-700";
    } else if (isDragActive) {
      className += "border-m3-primary bg-blue-50 text-m3-primary";
    } else {
      className += "border-gray-300 bg-white text-gray-600 hover:border-m3-primary hover:bg-blue-50 hover:text-m3-primary";
    }

    if (isUploading) {
      className += " pointer-events-none opacity-75";
    }

    return className;
  };

  const clearResults = () => {
    setUploadResults([]);
  };

  const removeResult = (id: string) => {
    setUploadResults(prev => prev.filter(result => result.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Main Dropzone */}
      <div
        {...getRootProps()}
        className={getDropzoneClassName()}
        role="button"
        aria-label="Upload CSV files"
        tabIndex={0}
      >
        <input {...getInputProps()} />

        {/* Upload Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors duration-300">
            <UploadIcon className="h-8 w-8 text-gray-500 group-hover:text-m3-primary transition-colors duration-300" />
          </div>
        </div>

        {/* Main Text */}
        <div className="space-y-2">
          {isDragActive ? (
            isDragAccept ? (
              <p className="text-xl font-semibold text-green-700">
                Drop your CSV files here...
              </p>
            ) : (
              <p className="text-xl font-semibold text-red-700">
                Some files are not supported
              </p>
            )
          ) : (
            <>
              <p className="text-xl font-semibold text-gray-900">
                Upload CSV Files
              </p>
              <p className="text-gray-600">
                Drag and drop your CSV files here, or click to browse
              </p>
            </>
          )}
        </div>

        {/* File Type Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <FileTextIcon className="h-4 w-4" />
              <span>CSV, TSV, TXT</span>
            </div>
            <div className="flex items-center space-x-2">
              <InfoIcon className="h-4 w-4" />
              <span>Up to 500MB per file</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-m3-primary mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Processing files...</p>
            </div>
          </div>
        )}
      </div>

      {/* Sample Files Suggestion */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InfoIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">
              First time using the CSV Parser?
            </p>
            <p className="text-blue-700">
              Try uploading a sample CSV file to explore features like column reordering,
              filtering, inline editing, and export capabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Results
            </h3>
            <button
              onClick={clearResults}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              Clear All
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {uploadResults.map((result) => (
              <div key={result.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {result.status === 'pending' && (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    )}
                    {result.status === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-m3-primary border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {result.status === 'success' && (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    )}
                    {result.status === 'error' && (
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.file.name}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(result.file.size)}</span>
                      {shouldUsePerformanceMode(result.file) && (
                        <span className="flex items-center space-x-1">
                          <InfoIcon className="h-3 w-3" />
                          <span>Large file - Performance mode</span>
                        </span>
                      )}
                    </div>
                    {result.error && (
                      <p className="text-xs text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeResult(result.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200 ml-3"
                  aria-label="Remove from list"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
