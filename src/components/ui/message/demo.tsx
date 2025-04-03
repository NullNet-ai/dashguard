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
      user: "Toom Cook",
      content: "Called client, they reassured me the invoice would be paid by the 25th",
      timestamp: new Date("2023-09-20T10:30:00"),
      isCurrentUser: false
    },
    {
      id: "2",
      user: "You",
      content: "Thanks for the update. I'll make a note of that in our system.",
      timestamp: new Date("2023-09-20T10:35:00"),
      isCurrentUser: true
    },
    {
      id: "3",
      user: "Toom Cook",
      content: "I've also sent them a follow-up email with the updated payment terms.",
      timestamp: new Date("2023-09-20T10:40:00"),
      isCurrentUser: false
    }
  ]);

  // Custom styling options
  const [customConfig, setCustomConfig] = React.useState({
    currentUserBgColor: "bg-primary",
    otherUserBgColor: "bg-gray-100",
    currentUserTextColor: "text-primary-foreground",
    otherUserTextColor: "text-gray-800",
    showTimestamps: true,
    showUserNames: true,
    messageAlignment: "alternate" as MessageAlignment, // Add type assertion here
    threadMaxHeight: 500,
    dateFormat: "MMM d",
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

  // Toggle between different message alignments
  const toggleMessageAlignment = () => {
    const alignments: MessageAlignment[] = ["alternate", "right", "left"];
    const currentIndex = alignments.indexOf(customConfig.messageAlignment);
    const nextIndex = (currentIndex + 1) % alignments.length;
    
    setCustomConfig({
      ...customConfig,
      messageAlignment: alignments[nextIndex] as MessageAlignment
    });
  };

  // Toggle timestamps visibility
  const toggleTimestamps = () => {
    setCustomConfig({
      ...customConfig,
      showTimestamps: !customConfig.showTimestamps
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Message Thread Component</h1>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Configuration Options</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={toggleMessageAlignment}
          >
            Alignment: {customConfig.messageAlignment}
          </Button>
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
          title="Customer Communication"
          placeholder="Type your message..."
          submitButtonText="Send"
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
              showPreview: true
            }
          }}
          inputConfig={{
            minHeight: 60,
            maxHeight: 200,
            maxCharCount: 500,
            showCharCount: true,
            className: "border-primary/20",
          }}
        />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Component Features</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Fully configurable styling for messages (colors, alignment, etc.)</li>
          <li>Customizable date and time formats</li>
          <li>Toggle visibility of timestamps and user names</li>
          <li>Configurable emoji picker options</li>
          <li>Adjustable thread height and message input settings</li>
          <li>Auto-expanding input box that grows with content</li>
          <li>File attachment functionality</li>
          <li>Character counter with configurable maximum limit</li>
        </ul>
      </div>
    </div>
  );
};