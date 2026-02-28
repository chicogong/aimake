import { describe, it, expect } from 'vitest';
import { users, voices, jobs, subscriptions, usageLogs } from '../db/schema';

describe('Database Schema', () => {
  describe('Users Table', () => {
    it('has required columns', () => {
      expect(users.id).toBeDefined();
      expect(users.clerkId).toBeDefined();
      expect(users.email).toBeDefined();
      expect(users.plan).toBeDefined();
      expect(users.quotaLimit).toBeDefined();
      expect(users.quotaUsed).toBeDefined();
    });
  });

  describe('Voices Table', () => {
    it('has required columns', () => {
      expect(voices.id).toBeDefined();
      expect(voices.name).toBeDefined();
      expect(voices.nameZh).toBeDefined();
      expect(voices.provider).toBeDefined();
      expect(voices.gender).toBeDefined();
    });
  });

  describe('Jobs Table', () => {
    it('has required columns', () => {
      expect(jobs.id).toBeDefined();
      expect(jobs.userId).toBeDefined();
      expect(jobs.contentType).toBeDefined();
      expect(jobs.sourceType).toBeDefined();
      expect(jobs.sourceContent).toBeDefined();
      expect(jobs.status).toBeDefined();
    });

    it('has progress tracking columns', () => {
      expect(jobs.progress).toBeDefined();
      expect(jobs.currentStage).toBeDefined();
      expect(jobs.errorCode).toBeDefined();
      expect(jobs.errorMessage).toBeDefined();
      expect(jobs.isDeleted).toBeDefined();
    });

    it('has output columns', () => {
      expect(jobs.audioUrl).toBeDefined();
      expect(jobs.audioFormat).toBeDefined();
      expect(jobs.duration).toBeDefined();
      expect(jobs.fileSize).toBeDefined();
      expect(jobs.script).toBeDefined();
    });

    it('has settings and metadata columns', () => {
      expect(jobs.settings).toBeDefined();
      expect(jobs.title).toBeDefined();
      expect(jobs.detectedContentType).toBeDefined();
      expect(jobs.isQuickTts).toBeDefined();
      expect(jobs.streamToken).toBeDefined();
    });
  });

  describe('Subscriptions Table', () => {
    it('has required columns', () => {
      expect(subscriptions.id).toBeDefined();
      expect(subscriptions.userId).toBeDefined();
      expect(subscriptions.stripeSubscriptionId).toBeDefined();
      expect(subscriptions.status).toBeDefined();
    });
  });

  describe('Usage Logs Table', () => {
    it('has required columns', () => {
      expect(usageLogs.id).toBeDefined();
      expect(usageLogs.userId).toBeDefined();
      expect(usageLogs.type).toBeDefined();
      expect(usageLogs.charsUsed).toBeDefined();
      expect(usageLogs.durationUsed).toBeDefined();
    });

    it('has job reference', () => {
      expect(usageLogs.jobId).toBeDefined();
    });
  });
});
