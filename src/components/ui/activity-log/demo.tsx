"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ActivityLog, type ActivityItem } from "./index";
import { FaceSmileIcon } from '@heroicons/react/20/solid';
import { HandThumbUpIcon, UserIcon } from "@heroicons/react/24/solid";
import { Check, PaperclipIcon } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';

export const sampleActivities: ActivityItem[] = [
  {
    id: "1",
    type: "applied",
    target: "Front End Developer",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
    user: {
      name: "John Doe",
      avatarFallback: "JD",
    },
    icon: (
      <div className="h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center">
        <UserIcon className="h-3 w-3 text-white" />
      </div>
    ),
  },
  {
    id: "2",
    type: "advanced",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    user: {
      name: "Bethany Blake",
      avatarFallback: "BB",
    },
    icon: (
      <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
        <HandThumbUpIcon className="h-3 w-3 text-white" />
      </div>
    ),
  },
  {
    id: "2.5",
    type: "completed",
    description: "Complete phone screening with Tom Cook",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 5)),
    user: {
      name: "Tom Cook",
      avatarFallback: "TC",
    },
    icon: (
      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
        <Check className="h-3 w-3 text-white" strokeWidth={4} />
      </div>
    ),
  },
  {
    id: "3",
    type: "completed",
    timestamp: new Date(),
    user: {
      name: "Martha Gardner",
      avatarFallback: "MG",
    },
    icon: (
      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
        <Check className="h-3 w-3 text-white" strokeWidth={4} />
      </div>
    ),
  },
];

export const commentActivities: ActivityItem[] = [
  {
    id: "4",
    type: "created",
    timestamp: new Date("2023-09-20"),
    user: {
      name: "Chelsea Hagon",
      avatarFallback: "CH",
    },
    description: "created the invoice.",
  },
  {
    id: "6",
    type: "comment",
    timestamp: new Date("2023-09-20"),
    user: {
      name: "Tom Cook",
      avatar: "https://ui-avatars.com/api/?name=Tom+Cook&background=random&size=40",
      avatarFallback: "TC",
    },
    comment: "Called client, they reassured me the invoice would be paid by the 25th.",
    customContent: () => {
      return (
        <div className="mt-1 border rounded-md bg-white">
          <div className="flex justify-between items-center p-3 pb-2">
            <div className="text-sm font-medium text-gray-700">Tom Cook commented</div>
            <div className="text-xs text-muted-foreground">Sep 20</div>
          </div>
          <div className="px-3 pb-3">
            <div className="text-sm">
              Called client, they reassured me the invoice would be paid by the 25th.
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "5",
    type: "paid",
    timestamp: new Date("2023-09-20"),
    user: {
      name: "Alex Curren",
      avatarFallback: "AC",
    },
    description: "paid the invoice.",
    icon: (
      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
        <Check className="h-3 w-3 text-white" strokeWidth={4} />
      </div>
    ),
    customContent: () => {
      return (
        <div className="mt-1 border rounded-md bg-white">
          <div className="px-3 py-3">
            <div className="text-sm">
              Alex Curren paid the invoice 7d ago
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "7",
    type: "comment-form",
    timestamp: new Date("2023-09-20"),
    user: {
      name: "You",
      avatarFallback: "You",
    },
    customContent: () => {
      return (
        <div className="mt-1 border rounded-md bg-white">
          <div className="p-3">
            <Textarea
              placeholder="Add your comment..."
              className="min-h-[80px] text-sm border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            />
          </div>
          <div className="px-3 py-2 flex justify-between items-center">
            <div className="flex gap-2">
              <button className="text-muted-foreground hover:text-gray-700">
                <PaperclipIcon className="size-5" />
              </button>
              <button className="text-muted-foreground hover:text-gray-700">
                <FaceSmileIcon className='size-5'/>
              </button>
            </div>
          </div>
        </div>
      );
    },
  }
];

export const multipleItemActivities: ActivityItem[] = [
  {
    id: "1",
    type: "assigned",
    target: "Kristin Watson",
    timestamp: new Date("2023-09-20"),
    user: {
      name: "Hilary Mahy",
      avatarFallback: "HM",
    },
  },
  {
    id: "2",
    type: "tagged",
    timestamp: new Date("2023-09-20"),
    user: {
      name: "Hilary Mahy",
      avatarFallback: "HM",
    },
    customContent: () => (
      <div className="flex items-center gap-1 text-sm mb-2">
        <span>added tags</span>
        <Badge variant="secondary" className="text-[10px]"><span className='size-2 mr-1 bg-red-500 rounded-full'></span>Bug</Badge>
        <Badge variant="secondary" className="text-[10px]"><span className='size-2 mr-1 bg-blue-500 rounded-full'></span>Accessibility</Badge>
      </div>
    ),
  },
  {
    id: "3",
    type: "comment",
    timestamp: new Date(),
    user: {
      name: "Tom Cook",
      avatarFallback: "TC",
    },
    comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam.",
    customContent: () => {
      return (
        <div className="mt-1 mb-4">
          <div className="flex items-center gap-1">
            <span className="font-medium">Tom Cook</span>
            <span className="text-sm text-muted-foreground">
              Commented 2h ago
            </span>
          </div>
          <div className="mt-1 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam.
          </div>
        </div>
      );
    },
  }
];


interface ActivityLogCardProps {
  title?: React.ReactNode;
  activities: ActivityItem[];
  variant?: "simple" | "list";
  showTimestamp?: boolean;
  showUser?: boolean;
  timeFormat?: "relative" | "absolute";
  absoluteTimeFormat?: string;
  className?: string;
  itemClassName?: string;
  maxItems?: number;
  emptyState?: React.ReactNode;
  onCommentClick?: (activityId: string) => void;
  showCommentForm?: boolean;
  commentFormPosition?: "top" | "bottom";
  showConnectingLines?: boolean; 
}

export const ActivityLogCard: React.FC<ActivityLogCardProps> = ({
  title,
  activities,
  variant = "simple",
  showTimestamp = true,
  showUser = true,
  timeFormat = "absolute",
  absoluteTimeFormat = "MMM d",
  className,
  itemClassName,
  maxItems,
  emptyState,
  onCommentClick,
  showCommentForm = false,
  commentFormPosition = "bottom",
  showConnectingLines = true,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = () => {
    setNewComment("");
  };

  const commentForm = (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-1">
        <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">
          <span className="text-[10px]">You</span>
        </div>
      </div>
      <div className="flex-1">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your comment..."
          className="min-h-[80px] text-sm"
        />
        <div className="flex items-center gap-2 mt-2">
          <Button size="sm" variant="outline" className="text-xs">
            <PaperclipIcon className="h-3 w-3 mr-1" />
            Attach
          </Button>
          <Button size="sm" className="text-xs" onClick={handleSubmitComment}>Comment</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
      )}

      {showCommentForm && commentFormPosition === "top" && (
        <div className="mb-6">{commentForm}</div>
      )}

      <ActivityLog
        activities={activities.map(activity => {
          if (activity.customContent && activity.type === "comment") {
            return {
              ...activity,
              hideTimestamp: true
            };
          }
          return activity;
        })}
        variant={variant}
        showTimestamp={showTimestamp}
        showUser={showUser}
        timeFormat={timeFormat}
        absoluteTimeFormat={absoluteTimeFormat}
        itemClassName={itemClassName}
        maxItems={maxItems}
        emptyState={emptyState}
        onCommentClick={onCommentClick}
        showConnectingLines={showConnectingLines} 
      />

      {showCommentForm && commentFormPosition === "bottom" && (
        <div className="mt-6 pt-4">{commentForm}</div>
      )}
    </div>
  );
};

export const ActivityLogDemo: React.FC = () => {
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");


  const handleSubmitComment = () => {
    setNewComment("");
    setCommentingOn(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ActivityLogCard
        title="Simple With Icons"
        activities={sampleActivities}
        variant="simple"
      />

      <ActivityLogCard
        title="Simple With Icons List"
        activities={sampleActivities}
        variant="list"
      />

      <ActivityLogCard
        title="Comment"
        activities={commentActivities}
        variant="simple"
        showCommentForm={true}
        commentFormPosition="bottom"
      />

      <ActivityLogCard
        title="Comments List"
        activities={commentActivities}
        variant="list"
      />

      <ActivityLogCard
        title="Multiple Item Type"
        activities={multipleItemActivities}
        variant="simple"
      />

      <ActivityLogCard
        title="Multiple Item Type List"
        activities={multipleItemActivities}
        variant="list"
      />

      {commentingOn && (
        <div className="col-span-1 md:col-span-2 p-4 border rounded-md">
          <h3 className="font-medium mb-2">Add Comment</h3>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your comment here..."
            className="mb-3"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCommentingOn(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitComment}>
              Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};