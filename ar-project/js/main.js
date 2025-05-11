AFRAME.registerComponent("play-sound-on-marker", {
  init: function () {
    this.el.addEventListener("markerFound", () => {
      const sound = document.querySelector("[sound]");
      if (sound) sound.components.sound.playSound();
    });
  },
});
