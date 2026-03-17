import fs from 'fs';
import path from 'path';
import { loadKnowledgeBase, type KnowledgeFile } from './loader';

export interface FreshnessReport {
  totalFiles: number;
  staleFiles: FreshnessEntry[];
  freshFiles: FreshnessEntry[];
  checkedAt: string;
}

export interface FreshnessEntry {
  relativePath: string;
  title: string;
  lastReviewed: string | null;
  reviewIntervalMonths: number;
  fileModifiedAt: string;
  daysSinceReview: number | null;
  isStale: boolean;
}

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'knowledge-base');

function getFileModifiedDate(filePath: string): Date {
  const stats = fs.statSync(filePath);
  return stats.mtime;
}

function daysBetween(date1: Date, date2: Date): number {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function evaluateFile(file: KnowledgeFile): FreshnessEntry {
  const fileModified = getFileModifiedDate(file.filePath);
  const now = new Date();

  let lastReviewDate: Date | null = null;
  if (file.meta.last_reviewed) {
    lastReviewDate = new Date(file.meta.last_reviewed);
  }

  const daysSinceReview = lastReviewDate ? daysBetween(lastReviewDate, now) : null;
  const staleDays = file.meta.review_interval_months * 30;
  const isStale = daysSinceReview === null || daysSinceReview > staleDays;

  return {
    relativePath: file.relativePath,
    title: file.meta.title,
    lastReviewed: file.meta.last_reviewed || null,
    reviewIntervalMonths: file.meta.review_interval_months,
    fileModifiedAt: fileModified.toISOString(),
    daysSinceReview,
    isStale,
  };
}

export function checkFreshness(): FreshnessReport {
  const files = loadKnowledgeBase();
  const entries = files.map(evaluateFile);

  return {
    totalFiles: entries.length,
    staleFiles: entries.filter((e) => e.isStale),
    freshFiles: entries.filter((e) => !e.isStale),
    checkedAt: new Date().toISOString(),
  };
}
