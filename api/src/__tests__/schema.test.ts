import { describe, it, expect } from 'vitest';
import { users, voices, audios, ttsJobs, podcasts, subscriptions, usageLogs } from '../db/schema';

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

  describe('Audios Table', () => {
    it('has required columns', () => {
      expect(audios.id).toBeDefined();
      expect(audios.userId).toBeDefined();
      expect(audios.text).toBeDefined();
      expect(audios.voiceId).toBeDefined();
      expect(audios.audioUrl).toBeDefined();
      expect(audios.duration).toBeDefined();
    });
  });

  describe('TTS Jobs Table', () => {
    it('has required columns', () => {
      expect(ttsJobs.id).toBeDefined();
      expect(ttsJobs.userId).toBeDefined();
      expect(ttsJobs.status).toBeDefined();
      expect(ttsJobs.text).toBeDefined();
      expect(ttsJobs.voiceId).toBeDefined();
    });
  });

  describe('Podcasts Table', () => {
    it('has required columns', () => {
      expect(podcasts.id).toBeDefined();
      expect(podcasts.userId).toBeDefined();
      expect(podcasts.title).toBeDefined();
      expect(podcasts.status).toBeDefined();
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
  });
});
