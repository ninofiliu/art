<template>
  <div class="app">
    <div class="controls"/>
    <div class="display"/>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
}
</style>

<style lang="scss" scoped>
.app {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
}
.controls {
  background-color: grey;
  width: 30%;
}
.display {
  background-color: darkgrey;
  width: 70%;
}
</style>
