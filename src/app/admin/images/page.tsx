"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, X, RefreshCw, CheckCircle } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  previewUrl: string;
  status: "success" | "uploading" | "error";
  progress: number;
}

export default function AdminImagePortal() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  
  // Track which file is being replaced
  const [replacingFileId, setReplacingFileId] = useState<string | null>(null);

  // Preloaded mock uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "img-1",
      name: "TIGER PRAWNS.jpg",
      size: "27.8 KB",
      previewUrl: "/images/TIGER PRAWNS.jpg",
      status: "success",
      progress: 100
    },
    {
      id: "img-2",
      name: "black pomfret.jpg",
      size: "37.7 KB",
      previewUrl: "/images/black pomfret.jpg",
      status: "success",
      progress: 100
    },
    {
      id: "img-3",
      name: "silver pompret.jpeg",
      size: "173.7 KB",
      previewUrl: "/images/silver pompret.jpeg",
      status: "success",
      progress: 100
    },
    {
      id: "img-4",
      name: "Bombil-main.jpg",
      size: "96.6 KB",
      previewUrl: "/images/Bombil-main.jpg",
      status: "success",
      progress: 100
    }
  ]);

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Process selected files
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      // Create Object URL for preview
      const previewUrl = URL.createObjectURL(file);
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

      const newFile: UploadedFile = {
        id,
        name: file.name,
        size: sizeStr,
        previewUrl,
        status: "uploading",
        progress: 0
      };

      setUploadedFiles((prev) => [newFile, ...prev]);

      // Simulate Upload Progress
      let curProgress = 0;
      const interval = setInterval(() => {
        curProgress += 25;
        setUploadedFiles((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  progress: curProgress,
                  status: curProgress >= 100 ? "success" : "uploading"
                }
              : item
          )
        );

        if (curProgress >= 100) {
          clearInterval(interval);
          triggerNotification(`Uploaded: ${file.name}`);
        }
      }, 300);
    });
  };

  // Replace file handlers
  const triggerReplace = (id: string) => {
    setReplacingFileId(id);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && replacingFileId) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;

      setUploadedFiles((prev) =>
        prev.map((item) =>
          item.id === replacingFileId
            ? {
                ...item,
                name: file.name,
                size: sizeStr,
                previewUrl,
                status: "uploading",
                progress: 0
              }
            : item
        )
      );

      const id = replacingFileId;
      let curProgress = 0;
      const interval = setInterval(() => {
        curProgress += 25;
        setUploadedFiles((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  progress: curProgress,
                  status: curProgress >= 100 ? "success" : "uploading"
                }
              : item
          )
        );

        if (curProgress >= 100) {
          clearInterval(interval);
          triggerNotification(`Replaced with: ${file.name}`);
          setReplacingFileId(null);
        }
      }, 300);
    }
  };

  // Delete handler
  const handleDelete = (id: string, name: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
    triggerNotification(`Deleted: ${name}`);
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border-gray bg-white transition-all hover:bg-light-gray active-scale"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-black text-foreground uppercase tracking-wider">
            Image Upload Portal
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Admin System Architecture for Seafood Inventory Images.
          </p>
        </div>
      </div>

      {/* Notifications banner */}
      {notification && (
        <div className="rounded-xl bg-neutral-900 text-white px-4 py-3 text-xs flex items-center justify-between shadow-md animate-fade-in">
          <span>{notification}</span>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive
            ? "border-brand-red bg-brand-red/5"
            : "border-border-gray bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
        }`}
      >
        <UploadCloud className="h-10 w-10 text-zinc-400 mb-3" />
        <h3 className="text-xs font-bold text-foreground">
          Drag & Drop file here, or click to choose
        </h3>
        <p className="text-[10px] text-zinc-400 mt-1.5 leading-normal max-w-xs">
          Only high-res JPEG, PNG, or WEBP images from the local repository catalog are saved. Maximum size 5MB.
        </p>

        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={replaceInputRef}
          onChange={handleReplaceChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Uploaded Files Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Uploaded Assets ({uploadedFiles.length})
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3.5 rounded-2xl border border-border-gray bg-white p-3.5 shadow-sm relative overflow-hidden group"
            >
              {/* Preview Image */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-light-gray border border-border-gray/50">
                {/* eslint-disable-next-line @next/next/no-img-element -- Upload previews can use blob: object URLs. */}
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* File details & options */}
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-xs font-bold text-foreground truncate">
                  {file.name}
                </h4>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  {file.size}
                </span>

                {/* Upload Status / Progress Indicator */}
                {file.status === "uploading" ? (
                  <div className="mt-2 space-y-1">
                    <div className="w-full bg-light-gray h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-red h-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-400 font-semibold uppercase block">
                      Uploading {file.progress}%
                    </span>
                  </div>
                ) : (
                  <div className="mt-2.5 flex gap-3.5">
                    <button
                      onClick={() => triggerReplace(file.id)}
                      className="text-[10px] font-extrabold text-zinc-400 hover:text-brand-red flex items-center gap-1 transition-colors active-scale"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Replace
                    </button>
                    <button
                      onClick={() => handleDelete(file.id, file.name)}
                      className="text-[10px] font-extrabold text-zinc-400 hover:text-brand-red flex items-center gap-1 transition-colors active-scale"
                    >
                      <X className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
