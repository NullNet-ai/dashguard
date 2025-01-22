const menu = Object.values({
  Dashboard: require("./dashboard").default,
  Favorite: require("./favorite").default,
  Settings: require("./settings").default,
  ActivityLog: require("./activity_log").default,
});

export default menu;