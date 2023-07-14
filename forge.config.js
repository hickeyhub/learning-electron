module.exports = {
  packagerConfig: {
    asar: true,
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "ionrocking-plateform",
        iconUrl: "./profile.ico",
      },
    },
  ],
};
