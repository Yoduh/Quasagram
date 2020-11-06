import Vue from "vue";

Vue.prototype.$api = process.env.DEV
  ? process.env.API_LOCAL
  : process.env.API_PROD;

Vue.prototype.$serviceWorkerSupported =
  "serviceWorker" in navigator ? true : false;

Vue.prototype.$channel = new BroadcastChannel("sw-messages");
Vue.prototype.$channel.addEventListener("message", event => {
  console.log("Received", event.data);
});

Vue.prototype.$pushNotificationsSupported =
  "PushManager" in window ? true : false;
