import { apiUrl } from './api';

// Helper function to get avatar URL from user avatar path
export const getAvatarUrl = (avatar: string | null, userName: string): string => {
  if (!avatar) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=128`;
  }
  if (avatar.startsWith('http')) return avatar;
  const filename = avatar.split('/').pop();
  if (!filename) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=128`;
  }
  return `${apiUrl('/api').replace(/\/$/, '')}/avatars/${filename}`;
};
