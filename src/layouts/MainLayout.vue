<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered class="bg-white text-grey-10">
      <q-toolbar class="constrain">
        <q-btn
          icon="eva-camera-outline"
          size="18px"
          flat
          round
          dense
          to="/camera"
          class="large-screen-only q-mr-sm"
        ></q-btn>
        <q-separator spaced vertical class="large-screen-only" />
        <q-toolbar-title class="text-grand-hotel text-bold">
          Quasagram
        </q-toolbar-title>
        <q-btn
          icon="eva-home-outline"
          size="18px"
          flat
          round
          dense
          to="/"
          class="large-screen-only"
        ></q-btn>
      </q-toolbar>
    </q-header>
    <q-footer class="bg-white" bordered>
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div v-if="showAppInstallBanner" class="banner-container bg-primary">
          <div class="constrain">
            <q-banner inline-actions dense class="bg-primary text-white">
              <template v-slot:avatar>
                <q-avatar
                  color="white"
                  text-color="grey-10"
                  font-size="22px"
                  icon="eva-camera-outline"
                ></q-avatar>
              </template>
              <b>Install Quasagram?</b>
              <template v-slot:action>
                <q-btn
                  class="q-px-sm"
                  dense
                  flat
                  label="Yes"
                  @click="installApp"
                />
                <q-btn
                  class="q-px-sm"
                  dense
                  flat
                  label="Later"
                  @click="showAppInstallBanner = false"
                />
                <q-btn
                  class="q-px-sm"
                  dense
                  flat
                  label="Never"
                  @click="neverShowAppInstallBanner"
                />
              </template>
            </q-banner>
          </div>
        </div>
      </transition>
      <q-toolbar-title>
        <q-tabs
          class="text-grey-10 small-screen-only"
          active-color="primary"
          indicator-color="transparent"
        >
          <q-route-tab icon="eva-home-outline" to="/" />
          <q-route-tab icon="eva-camera-outline" to="/camera" /> </q-tabs
      ></q-toolbar-title>
    </q-footer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",
  data() {
    return {
      showAppInstallBanner: false,
      deferredPrompt: null
    };
  },
  methods: {
    installApp() {
      // Hide banner
      this.showAppInstallBanner = false;
      // Show the install prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
          this.neverShowAppInstallBanner();
        } else {
          console.log("User dismissed the install prompt");
        }
      });
    },
    neverShowAppInstallBanner() {
      this.showAppInstallBanner = false;
      window.localStorage.setItem("neverShowAppInstallBanner", true);
    }
  },
  async mounted() {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate();
      const percentUsed = Math.round((usage / quota) * 100);
      const usageInMib = Math.round(usage / (1024 * 1024));
      const quotaInMib = Math.round(quota / (1024 * 1024));

      const details = `${usageInMib} out of ${quotaInMib} MiB used (${percentUsed}%)`;
      console.log("deets", details);
    }
    const hideBanner = window.localStorage.getItem("neverShowAppInstallBanner");
    if (!hideBanner) {
      window.addEventListener("beforeinstallprompt", e => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        this.deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        setTimeout(() => {
          this.showAppInstallBanner = true;
        }, 2000);
      });
    }
  }
};
</script>

<style lang="sass">
.q-toolbar
  @media (min-width: $breakpoint-sm-min)
    height: 77px

.q-toolbar__title
  @media (max-width: $breakpoint-xs-max)
    text-align: center
  font-size: 30px

.q-tab__icon
  font-size: 30px
</style>
