/* eslint-disable no-console */
'use client'
import * as React from "react";
import { MessageThread, type MessageThreadComment } from "./message-thread";
import { Button } from "~/components/ui/button";

type MessageAlignment = "alternate" | "right" | "left";

export const MessageThreadDemo: React.FC = () => {
  const [comments, setComments] = React.useState<MessageThreadComment[]>([
    {
      id: "1",
      user: "John Smith",
      content: "This is really helpful information. I've been looking for a solution like this for a while.",
      timestamp: new Date("2023-09-20T10:30:00"),
      isCurrentUser: false
    },
    {
      id: "2",
      user: "You",
      content: "Thanks! I'm glad you found it useful. Let me know if you have any questions.",
      timestamp: new Date("2023-09-20T10:35:00"),
      isCurrentUser: true
    },
    {
      id: "3",
      user: "Sarah Johnson",
      content: "Could you provide more details about the implementation? I'm particularly interested in how you handled the edge cases.",
      timestamp: new Date("2023-09-20T10:40:00"),
      isCurrentUser: false
    }
  ]);

  // Custom styling options
  const [customConfig, setCustomConfig] = React.useState({
    currentUserBgColor: "bg-blue-100",
    otherUserBgColor: "bg-gray-50",
    currentUserTextColor: "text-gray-800",
    otherUserTextColor: "text-gray-800",
    showTimestamps: true,
    showUserNames: true,
    messageAlignment: "left" as MessageAlignment,
    threadMaxHeight: Number.MAX_SAFE_INTEGER, // Allow it to grow naturally
    dateFormat: "MMM d, yyyy",
    timeFormat: "h:mm a",
  });

  const handleCommentSubmit = (content: string) => {
    // Add the new comment to the comments array
    const newComment = {
      id: Date.now().toString(),
      user: "You",
      content: content,
      timestamp: new Date(),
      isCurrentUser: true
    };
    
    setComments([...comments, newComment]);
    console.log("Comment submitted:", content);
  };

  const handleAttachmentClick = () => {
    console.log("Attachment button clicked");
    // In a real implementation, this would open a file picker
    alert("File attachment functionality would be implemented here");
  };

  const handleEmojiClick = () => {
    console.log("Emoji button clicked");
  };

  // Toggle timestamps visibility
  const toggleTimestamps = () => {
    setCustomConfig({
      ...customConfig,
      showTimestamps: !customConfig.showTimestamps
    });
  };

  return (
    <div className="p-4 ">
      <h1 className="text-2xl font-bold mb-6">Comments Section</h1>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Display Options</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={toggleTimestamps}
          >
            {customConfig.showTimestamps ? "Hide" : "Show"} Timestamps
          </Button>
        </div>
      </div>
      
      <div className="mb-8">
        <MessageThread
          comments={comments}
          onCommentSubmit={handleCommentSubmit}
          onAttachmentClick={handleAttachmentClick}
          onEmojiClick={handleEmojiClick}
          title="Discussion"
          placeholder="Add a comment..."
          submitButtonText="Post Comment"
          currentUserBgColor={customConfig.currentUserBgColor}
          otherUserBgColor={customConfig.otherUserBgColor}
          currentUserTextColor={customConfig.currentUserTextColor}
          otherUserTextColor={customConfig.otherUserTextColor}
          showTimestamps={customConfig.showTimestamps}
          showUserNames={customConfig.showUserNames}
          messageAlignment={customConfig.messageAlignment}
          threadMaxHeight={customConfig.threadMaxHeight}
          dateFormat={customConfig.dateFormat}
          timeFormat={customConfig.timeFormat}
          emojiPickerConfig={{
            searchDisabled: false,
            skinTonesDisabled: false,
            width: 320,
            height: 400,
            previewConfig: {
              showPreview: false
            }
          }}
          inputConfig={{
            minHeight: 80,
            maxHeight: 200,
            showCharCount: false,
            maxCharCount: Number.MAX_SAFE_INTEGER,
            className: "border-gray-200 shadow-sm",
            textareaClassName: "resize-none"
          }}
          helperText={{
            emoji: "",
            enter: ""
          }}
        />
      </div>
   
    </div>
  );
};