export const mockNotifications = [
  ...Array(50).fill(null).map((_, index) => {
    const priorityLevel = Math.floor(Math.random() * 3);
    const getPriorityLabel = (level: number) => {
      switch (level) {
        case 2: return "high";
        case 1: return "medium";
        default: return "low";
      }
    };

    return {
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
      notification_status: "unread",
      priority_level: priorityLevel,
      priority_label: getPriorityLabel(priorityLevel),
      expiry_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "Active",
      metadata: {
        createdBy: `user_${Math.floor(Math.random() * 100)}`,
        department: ["IT", "HR", "Sales", "Marketing"][Math.floor(Math.random() * 4)]
      }
    };
  })
];