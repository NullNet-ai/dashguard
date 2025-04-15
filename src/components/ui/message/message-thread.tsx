'use client'
import * as React from "react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { MessageInputBox } from "./message-input-box";
import type { Theme, EmojiStyle } from 'emoji-picker-react';

export interface MessageThreadComment {
  id: string;
  user: string;
  content: string;
  timestamp: Date;
  isCurrentUser?: boolean;
}

export interface MessageInputConfig {
  minHeight?: number;
  maxHeight?: number;
  maxLines?: number;
  maxCharCount?: number;
  showCharCount?: boolean;
  className?: string;
  textareaClassName?: string;
  actionsClassName?: string;
  submitButtonClassName?: string;
}

export interface EmojiPickerConfig {
  searchDisabled?: boolean;
  skinTonesDisabled?: boolean;
  width?: number;
  height?: number;
  previewConfig?: {
    showPreview?: boolean;
  };
  lazyLoadEmojis?: boolean;
  searchPlaceHolder?: string;
  theme?: Theme;
  emojiStyle?: EmojiStyle;
}

export interface MessageThreadProps {
  /**
   * Array of comments to display
   */
  comments: MessageThreadComment[];
  
  /**
   * Callback when a new comment is submitted
   */
  onCommentSubmit: (content: string) => void;
  
  /**
   * Callback when attachment button is clicked
   */
  onAttachmentClick?: () => void;
  
  /**
   * Callback when emoji button is clicked
   */
  onEmojiClick?: () => void;
  
  /**
   * Title for the message thread
   */
  title?: string;
  
  /**
   * Placeholder text for the input box
   */
  placeholder?: string;
  
  /**
   * Text for the submit button
   */
  submitButtonText?: string;
  
  /**
   * Additional class name for the container
   */
  className?: string;
  
  /**
   * Background color class for current user messages
   */
  currentUserBgColor?: string;
  
  /**
   * Background color class for other users' messages
   */
  otherUserBgColor?: string;
  
  /**
   * Text color class for current user messages
   */
  currentUserTextColor?: string;
  
  /**
   * Text color class for other users' messages
   */
  otherUserTextColor?: string;
  
  /**
   * Show or hide timestamps
   */
  showTimestamps?: boolean;
  
  /**
   * Show or hide user names
   */
  showUserNames?: boolean;
  
  /**
   * Message alignment style
   */
  messageAlignment?: "alternate" | "right" | "left";
  
  /**
   * Maximum height for the thread container
   */
  threadMaxHeight?: number;
  
  /**
   * Date format string (date-fns format)
   */
  dateFormat?: string;
  
  /**
   * Time format string (date-fns format)
   */
  timeFormat?: string;
  
  /**
   * Configuration for the emoji picker
   */
  emojiPickerConfig?: EmojiPickerConfig;
  
  /**
   * Configuration for the input box
   */
  inputConfig?: MessageInputConfig;
  
  /**
   * Show or hide the helper text
   */
  showHelperText?: boolean;
  
  /**
   * Custom helper text
   */
  helperText?: {
    emoji?: string;
    enter?: string;
  };
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  comments,
  onCommentSubmit,
  onAttachmentClick,
  onEmojiClick,
  title = "Message Thread",
  placeholder = "Add your comment...",
  submitButtonText = "Send",
  className,
  currentUserBgColor = "bg-primary",
  otherUserBgColor = "bg-gray-100",
  currentUserTextColor = "text-primary-foreground",
  otherUserTextColor = "text-gray-800",
  showTimestamps = true,
  showUserNames = true,
  messageAlignment = "alternate",
  threadMaxHeight = Number.MAX_SAFE_INTEGER,
  dateFormat = "MMM d",
  timeFormat = "h:mm a",
  emojiPickerConfig,
  inputConfig,
  showHelperText = true,
  helperText = {
    emoji: "",
    enter: ""
  }
}) => {
  const [comment, setComment] = React.useState("");
  
  // Remove the thread height state and ref since we want it to grow naturally
  
  const handleSubmit = () => {
    if (comment.trim()) {
      onCommentSubmit(comment);
      setComment(""); // Clear the input after submission
    }
  };

  // Get message alignment class based on configuration
  const getMessageAlignment = (isCurrentUser: boolean | undefined) => {
    if (messageAlignment === "right") {
      return "ml-auto";
    } else if (messageAlignment === "left") {
      return "mr-auto";
    } else {
      // Alternate alignment based on user
      return isCurrentUser ? "ml-auto" : "mr-auto";
    }
  };

  return (
    <div className={cn("max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border", className)}>
      {title && <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>}
      
      {/* Display existing comments - remove all height constraints and overflow */}
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div 
            key={comment.id} 
            className={cn(
              "p-3 rounded-lg max-w-[80%]",
              getMessageAlignment(comment.isCurrentUser),
              comment.isCurrentUser 
                ? currentUserBgColor 
                : otherUserBgColor,
              comment.isCurrentUser 
                ? currentUserTextColor 
                : otherUserTextColor
            )}
          >
            {showUserNames && (
              <div className="flex justify-between items-start gap-4">
                <div className="font-medium">{comment.user}</div>
                {showTimestamps && (
                  <div className={cn(
                    "text-xs",
                    comment.isCurrentUser ? `${currentUserTextColor}/80` : "text-gray-500"
                  )}>
                    {format(comment.timestamp, timeFormat)}
                  </div>
                )}
              </div>
            )}
            <div className={cn(
              "mt-1 break-words",
              comment.isCurrentUser ? currentUserTextColor : otherUserTextColor
            )}>
              {comment.content}
            </div>
            {showTimestamps && (
              <div className={cn(
                "text-xs text-right mt-1",
                comment.isCurrentUser ? `${currentUserTextColor}/70` : "text-gray-400"
              )}>
                {format(comment.timestamp, dateFormat)}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Message input box */}
      <div className="mt-4 pt-4">
        <MessageInputBox
          value={comment}
          onChange={setComment}
          onSubmit={handleSubmit}
          onAttachmentClick={onAttachmentClick}
          onEmojiClick={onEmojiClick}
          placeholder={placeholder}
          submitButtonText={submitButtonText}
          minHeight={inputConfig?.minHeight ?? 60}
          maxHeight={inputConfig?.maxHeight ?? 200}
          maxLines={inputConfig?.maxLines}
          maxCharCount={inputConfig?.maxCharCount ?? Number.MAX_SAFE_INTEGER}
          className={inputConfig?.className ?? "border-primary/20"}
          textareaClassName={inputConfig?.textareaClassName}
          actionsClassName={inputConfig?.actionsClassName}
          submitButtonClassName={inputConfig?.submitButtonClassName}
          showCharCount={inputConfig?.showCharCount ?? false}
          emojiPickerConfig={emojiPickerConfig}
        />
        
        {showHelperText && (
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <div>
              {helperText.emoji}
            </div>
            <div>
              {helperText.enter}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};