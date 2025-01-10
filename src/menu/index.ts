const menu = Object.values({
  Dashboard: require("./dashboard").default,
  Favorite: require("./favorite").default,
  Settings: require("./settings").default,
});

export default menu;
