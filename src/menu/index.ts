const menu = Object.values({
  Dashboard: require("./dashboard").default,
  Favorite: require("./favorite").default,
  ActivityLog: require("./activity_log").default,
  Contact: require("./contact").default,
  Organization: require("./organization").default,
  Settings: require("./settings").default,
  DnaTestMenu: require("./dna_test_menu").default,
});

export default menu;