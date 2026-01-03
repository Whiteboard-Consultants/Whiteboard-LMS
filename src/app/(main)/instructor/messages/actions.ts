'use server';

import { getMessageThreads, getThreadMessages, sendMessage, closeMessageThread, getUnreadNotifications, markNotificationAsRead } from '@/app/api/messages/message-actions';

export { getMessageThreads, getThreadMessages, sendMessage, closeMessageThread, getUnreadNotifications, markNotificationAsRead };
