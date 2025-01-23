const menu = Object.values({
  Dashboard: require("./dashboard").default,
  Favorite: require("./favorite").default,
  ActivityLog: require("./activity_log").default,
  Contact: require("./contact").default,
  Organization: require("./organization").default,
  Settings: require("./settings").default,
  Animal: require("./animal").default,
});

export default menu;