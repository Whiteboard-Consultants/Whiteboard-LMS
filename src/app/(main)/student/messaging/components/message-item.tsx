'use client';

import { formatDistanceToNow } from 'date-fns';
import { CheckCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageItemProps {
  senderName: string;
  senderAvatar?: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isOwnMessage: boolean;
}

export function MessageItem({
  senderName,
  senderAvatar,
  body,
  timestamp,
  isRead,
  isOwnMessage,
}: MessageItemProps) {
  const initials = senderName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={senderAvatar} alt={senderName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className={`flex flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{senderName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </p>
        </div>

        <div
          className={`rounded-lg px-3 py-2 max-w-xs break-words ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <p className="text-sm">{body}</p>
        </div>

        {isOwnMessage && isRead && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCheck className="h-3 w-3" />
            <span>Read</span>
          </div>
        )}
      </div>
    </div>
  );
}
