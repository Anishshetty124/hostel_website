import React from 'react';

// Generic Skeleton Pulse Component
export const SkeletonPulse = ({ className = '' }) => (
  <div className={`bg-slate-200 dark:bg-gray-700 animate-pulse ${className}`} />
);

// Card Skeleton
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 shadow-md">
    <SkeletonPulse className="h-6 w-48 rounded-lg" />
    <SkeletonPulse className="h-4 w-full rounded-lg" />
    <SkeletonPulse className="h-4 w-5/6 rounded-lg" />
    <div className="flex gap-3 pt-2">
      <SkeletonPulse className="h-8 w-20 rounded-lg" />
      <SkeletonPulse className="h-8 w-20 rounded-lg" />
    </div>
  </div>
);

// Dashboard Grid Skeleton (4 cards)
export const DashboardGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-4 mb-4">
          <SkeletonPulse className="w-14 h-14 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <SkeletonPulse className="h-5 w-32 rounded-lg mb-2" />
            <SkeletonPulse className="h-4 w-20 rounded-lg" />
          </div>
        </div>
        <SkeletonPulse className="h-3 w-full rounded-lg" />
      </div>
    ))}
  </div>
);

// Gallery Grid Skeleton
export const GalleryGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 gap-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="group relative overflow-hidden rounded-2xl bg-slate-200 dark:bg-gray-700 aspect-[4/3]">
        <SkeletonPulse className="w-full h-full animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>
    ))}
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }) => (
  <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700">
    {[...Array(columns)].map((_, i) => (
      <SkeletonPulse key={i} className="flex-1 h-5 rounded-lg" />
    ))}
  </div>
);

// List Item Skeleton
export const ListItemSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 dark:border-gray-700 space-y-3">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <SkeletonPulse className="h-5 w-2/3 rounded-lg mb-2" />
        <SkeletonPulse className="h-4 w-1/2 rounded-lg" />
      </div>
      <SkeletonPulse className="w-16 h-8 rounded-lg flex-shrink-0" />
    </div>
    <SkeletonPulse className="h-3 w-full rounded-lg" />
    <div className="flex gap-2">
      <SkeletonPulse className="h-6 w-16 rounded-lg" />
      <SkeletonPulse className="h-6 w-16 rounded-lg" />
    </div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="space-y-6">
    {/* Avatar and basic info */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <SkeletonPulse className="w-24 h-24 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3 w-full md:w-auto">
          <SkeletonPulse className="h-6 w-48 rounded-lg" />
          <SkeletonPulse className="h-4 w-40 rounded-lg" />
          <SkeletonPulse className="h-4 w-32 rounded-lg" />
        </div>
      </div>
    </div>

    {/* Form fields */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i}>
          <SkeletonPulse className="h-4 w-32 rounded-lg mb-2" />
          <SkeletonPulse className="h-10 w-full rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// Header Skeleton
export const HeaderSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 p-6 md:p-8">
    <div className="max-w-7xl mx-auto">
      <SkeletonPulse className="h-8 md:h-10 w-64 rounded-lg mb-2" />
      <SkeletonPulse className="h-4 w-96 rounded-lg" />
    </div>
  </div>
);

// Complaint Card Skeleton
export const ComplaintCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-lg border border-slate-100 dark:border-gray-700 space-y-4">
    {/* Header */}
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3 flex-1">
        <SkeletonPulse className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <SkeletonPulse className="h-5 w-48 rounded-lg mb-2" />
          <SkeletonPulse className="h-4 w-32 rounded-lg" />
        </div>
      </div>
    </div>

    {/* Badges */}
    <div className="flex flex-wrap gap-2">
      <SkeletonPulse className="h-7 w-24 rounded-lg" />
      <SkeletonPulse className="h-7 w-24 rounded-lg" />
    </div>

    {/* Description */}
    <div className="bg-slate-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
      <SkeletonPulse className="h-4 w-40 rounded-lg" />
      <SkeletonPulse className="h-3 w-full rounded-lg" />
      <SkeletonPulse className="h-3 w-3/4 rounded-lg" />
    </div>

    {/* Replies section */}
    <div className="border-t border-slate-200 dark:border-gray-700 pt-4 space-y-3">
      <SkeletonPulse className="h-4 w-32 rounded-lg" />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2 bg-blue-50 dark:bg-blue-900/20">
          <SkeletonPulse className="h-4 w-24 rounded-lg" />
          <SkeletonPulse className="h-4 w-full rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// Stats Cards Skeleton
export const StatsCardsSkeleton = () => (
  <div className="grid grid-cols-3 gap-2 md:gap-6">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg md:rounded-3xl p-4 md:p-6 shadow-lg">
        <SkeletonPulse className="h-3 w-20 rounded-lg mb-3" />
        <SkeletonPulse className="h-8 w-16 rounded-lg" />
      </div>
    ))}
  </div>
);

// Room Card Skeleton
export const RoomCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md">
    <SkeletonPulse className="w-full h-48 rounded-0" />
    <div className="p-4 space-y-3">
      <SkeletonPulse className="h-5 w-32 rounded-lg" />
      <SkeletonPulse className="h-4 w-full rounded-lg" />
      <SkeletonPulse className="h-4 w-3/4 rounded-lg" />
      <div className="flex gap-2 pt-2">
        <SkeletonPulse className="h-8 flex-1 rounded-lg" />
        <SkeletonPulse className="h-8 flex-1 rounded-lg" />
      </div>
    </div>
  </div>
);

// Form Input Skeleton
export const FormInputSkeleton = () => (
  <div className="space-y-2">
    <SkeletonPulse className="h-4 w-24 rounded-lg" />
    <SkeletonPulse className="h-10 w-full rounded-lg" />
  </div>
);

// Admin Dashboard Skeleton
export const AdminDashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <HeaderSkeleton />

    {/* Stats Grid */}
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <StatsCardsSkeleton />

      {/* Table skeleton */}
      <div className="mt-8 space-y-3">
        <SkeletonPulse className="h-6 w-48 rounded-lg mb-4" />
        {[...Array(5)].map((_, i) => (
          <TableRowSkeleton key={i} columns={5} />
        ))}
      </div>
    </div>
  </div>
);

// Minimal Loading Skeleton (for small sections)
export const MinimalSkeleton = ({ height = 'h-6', width = 'w-full' }) => (
  <SkeletonPulse className={`${height} ${width} rounded-lg`} />
);

// Multi-line Skeleton (for paragraphs)
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-2">
    {[...Array(lines)].map((_, i) => (
      <SkeletonPulse
        key={i}
        className={`h-4 rounded-lg ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);
