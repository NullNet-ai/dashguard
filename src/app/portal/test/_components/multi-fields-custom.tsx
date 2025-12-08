'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '~/components/ui/input';
import { DateTimePicker } from '~/components/ui/date-picker';
import { cn } from '~/lib/utils';
import moment from 'moment-timezone';
import {
  CalendarIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface DocumentData {
  id: string;
  fileName: string;
  fileSize: string;
  uploadStatus: string;
  licenseNo: string;
  issueFrom: string;
  issueDate: string;
}

interface MultiFieldsCustomProps {
  className?: string;
  onDataChange?: (data: DocumentData[]) => void;
  initialData?: DocumentData[];
}

const MultiFieldsCustom: React.FC<MultiFieldsCustomProps> = ({
  className,
  onDataChange,
  initialData = [],
}) => {
  const [documents, setDocuments] = useState<DocumentData[]>(
    initialData.length > 0
      ? initialData
      : [
          {
            id: '1',
            fileName: 'License Screenshot.jpg',
            fileSize: '4kB',
            uploadStatus: '100% uploaded',
            licenseNo: 'ABC1234567',
            issueFrom: 'California, USA',
            issueDate: '2022-11-23',
          },
        ],
  );

  const handleLicenseNoChange = useCallback(
    (id: string, value: string) => {
      setDocuments((prev) => {
        const updated = prev.map((doc) =>
          doc.id === id ? { ...doc, licenseNo: value } : doc,
        );
        onDataChange?.(updated);
        return updated;
      });
    },
    [onDataChange],
  );

  const handleIssueFromChange = useCallback(
    (id: string, value: string) => {
      setDocuments((prev) => {
        const updated = prev.map((doc) =>
          doc.id === id ? { ...doc, issueFrom: value } : doc,
        );
        onDataChange?.(updated);
        return updated;
      });
    },
    [onDataChange],
  );

  const handleIssueDateChange = useCallback(
    (id: string, value: Date | undefined) => {
      setDocuments((prev) => {
        const updated = prev.map((doc) =>
          doc.id === id
            ? {
                ...doc,
                issueDate: value ? moment(value).format('YYYY-MM-DD') : '',
              }
            : doc,
        );
        onDataChange?.(updated);
        return updated;
      });
    },
    [onDataChange],
  );

  const handleRemoveDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => {
        const updated = prev.filter((doc) => doc.id !== id);
        onDataChange?.(updated);
        return updated;
      });
    },
    [onDataChange],
  );

  const handleRefreshDocument = useCallback(
    (id: string) => {
      // Refresh logic can be implemented here
      // For now, we'll just trigger a re-render or call onDataChange
      onDataChange?.(documents);
    },
    [documents, onDataChange],
  );

  return (
    <div className={cn('w-full space-y-4', className)}>
      {documents.map((document) => (
        <div key={document.id} className="rounded-lg bg-white p-6 shadow-sm">
          {/* Document Header */}

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="w-24 flex-shrink-0 text-sm font-medium text-gray-700 min-w-[30%]">
                Driver License
              </label>
              <div className=" flex items-center justify-between  rounded-md border border-slate-200 p-2 w-full flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                    <svg
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {document.fileName}
                    </h3>
                    <p className="text-xs text-green-600">
                      {document.fileSize} • {document.uploadStatus}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRefreshDocument(document.id)}
                    className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                    aria-label="Refresh document"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveDocument(document.id)}
                    className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-red-600"
                    aria-label="Remove document"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* License No */}
            <div className="flex items-center space-x-4">
              <label className="w-24 flex-shrink-0 text-sm font-medium text-gray-700 min-w-[30%]">
                License No.
              </label>
              <Input
                type="text"
                value={document.licenseNo}
                onChange={(e) =>
                  handleLicenseNoChange(document.id, e.target.value)
                }
                placeholder="Enter license number"
                className="flex-1 border-gray-200 bg-gray-50"
                name={`licenseNo-${document.id}`}
              />
            </div>

            {/* Issue From */}
            <div className="flex items-center space-x-4">
              <label className="w-24 flex-shrink-0 text-sm font-medium text-gray-700 min-w-[30%]">
                Issue From
              </label>
              <Input
                type="text"
                value={document.issueFrom}
                onChange={(e) =>
                  handleIssueFromChange(document.id, e.target.value)
                }
                placeholder="Enter issuing location"
                className="flex-1 border-gray-200 bg-gray-50"
                name={`issueFrom-${document.id}`}
              />
            </div>

            {/* Issue Date */}
            <div className="flex items-center space-x-4">
              <label className="w-24 flex-shrink-0 text-sm font-medium text-gray-700 min-w-[30%]">
                Issue Date
              </label>
              <DateTimePicker
                value={
                  document.issueDate ? new Date(document.issueDate) : undefined
                }
                onChange={(date) => handleIssueDateChange(document.id, date)}
                placeholder="Select issue date"
                granularity="day"
                className="flex-1 border-gray-200 bg-gray-50"
                name={`issueDate-${document.id}`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MultiFieldsCustom;
