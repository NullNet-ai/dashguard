import { ulid } from 'ulid';

export const mockNotifications = [
  {
    id: ulid(),
    title: "Session will expire soon",
    description: "Your session will expire in the next 15 minutes.",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    link: "https://google.com/",
    categories: ["System", "Security"],
    icon: "alert-triangle",
    source: "System",
    is_pinned: true,
    actions: [
      { 
        label: "Log Out Now",
        control: "button",
        value: "logout",
        className: "bg-red-500 text-white"
      },
      { 
        label: "Extend Session",
        control: "button",
        value: "extend",
        className: "bg-blue-500 text-white"
      }
    ],
    recipient_id: "550e8400-e29b-41d4-a716-446655440000",
    notification_status: "unread",
    priority_label: "high",
    priority_level: 2,
    expiry_date: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    status: "Active",
    metadata: { sessionId: "abc123" }
  },
  ...Array(49).fill(null).map((_, index) => {
    const priorityLevel = Math.floor(Math.random() * 3);
    const getPriorityLabel = (level: number) => {
      switch (level) {
        case 2: return "high";
        case 1: return "medium";
        default: return "low";
      }
    };

    return {
      id: ulid(),
      title: [
        "New Task Assignment",
        "Project Update",
        "Meeting Reminder",
        "Document Review Required",
        "System Alert",
        "Team Message",
        "Security Update",
        "Performance Report",
        "Database Backup Complete",
        "User Access Request"
      ][Math.floor(Math.random() * 10)],
      description: [
        "Please review the latest changes to the project documentation.",
        "Your team has scheduled a new meeting for tomorrow.",
        "A new task has been assigned to your department.",
        "System maintenance has been completed successfully.",
        "Important security update requires your attention.",
        "New comment on your recent submission.",
        "Project milestone achieved ahead of schedule.",
        "Weekly report is ready for your review.",
        "Team collaboration request pending.",
        "Database optimization completed successfully."
      ][Math.floor(Math.random() * 10)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      link: [
        'http://localhost:3000/portal/dashboard',
        'http://localhost:3000/portal/favorite',
        'http://localhost:3000/portal/contact/grid',
        'http://localhost:3000/portal/organization/grid',
        'http://localhost:3000/portal/role/grid',
        'https://google.com',
        'https://github.com',
        'https://stackoverflow.com',
        'https://linkedin.com',
        'https://youtube.com'
      ][Math.floor(Math.random() * 10)],
      categories: [
        ["System", "Security"],
        ["Social", "Updates"],
        ["System", "Tasks"],
        ["Social", "Calendar"],
        ["Social", "Review"]
      ][Math.floor(Math.random() * 5)],
      icon: [
        "alert-triangle",
        "message-circle",
        "info",
        "bell",
        "calendar",
        "file-text",
        "users",
        "settings"
      ][Math.floor(Math.random() * 8)],
      source: ["System", "Day Data", "Admin", "Team Lead", "Security"][Math.floor(Math.random() * 5)],
      is_pinned: Math.random() > 0.8,
      actions: Math.random() > 0.5 ? [
        {
          label: ["View", "Respond", "Accept", "Review", "Approve"][Math.floor(Math.random() * 5)],
          control: "button",
          value: ["view", "respond", "accept", "review", "approve"][Math.floor(Math.random() * 5)],
          className: ["bg-blue-500 text-white", "bg-green-500 text-white", "bg-red-500 text-white"][Math.floor(Math.random() * 3)]
        }
      ] : [],
      recipient_id: "01JCSAG79KQ1WM0F9B47Q700P1",
      notification_status: Math.random() > 0.3 ? "unread" : "read",
      priority_level: priorityLevel,
      priority_label: getPriorityLabel(priorityLevel),
      expiry_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.2 ? "Active" : "Archived",
      metadata: {
        createdBy: `user_${Math.floor(Math.random() * 100)}`,
        department: ["IT", "HR", "Sales", "Marketing"][Math.floor(Math.random() * 4)]
      }
    };
  })
];