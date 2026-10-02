import type React from 'react';

export type View =
  | 'explore'
  | 'forYou'
  | 'library'
  | 'myArchive'
  | 'uploaderHub'
  | 'uploaderDetail'
  | 'scriptorium'
  | 'movies'
  | 'audio'
  | 'image'
  | 'recroom'
  | 'settings'
  | 'help'
  | 'storyteller'
  | 'aiArchive'
  | 'webArchive';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmClass?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface Command {
  id: string;
  section: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string;
}
