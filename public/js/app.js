function getCurrentSeconds() {
  return Math.round(new Date().getTime() / 1000.0);
}

function stripSpaces(str) {
  return str.replace(/\s/g, '');
}

function truncateTo(str, digits) {
  if (str.length <= digits) {
    return str;
  }

  return str.slice(-digits);
}

const app = Vue.createApp({
  data() {
    return {
      secret_key: 'JBSWY3DPEHPK3PXP',
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
      updatingIn: 30,
      token: null,
      clipboardButton: null,
    };
  },

  mounted: function () {
    this.configure();
    this.update();

    this.intervalHandle = setInterval(this.update, 1000);

    this.clipboardButton = new ClipboardJS('#clipboard-button');
  },

  destroyed: function () {
    clearInterval(this.intervalHandle);
  },

  computed: {
    totp: function () {
      return new OTPAuth.TOTP({
        algorithm: this.algorithm,
        digits: this.digits,
        period: this.period,
        secret: OTPAuth.Secret.fromBase32(stripSpaces(this.secret_key)),
      });
    }
  },

  methods: {
    update: function () {
      this.updatingIn = this.period - (getCurrentSeconds() % this.period);
      this.token = truncateTo(this.totp.generate(), this.digits);
    },

    configure: function () {
      const queryParams = new URLSearchParams(window.location.search);
      // Get the key primarily from query parameters, then from the hash
      const key = queryParams.get('key') || document.location.hash.replace(/[#\/]+/, '').trim();
      const digits = parseInt(queryParams.get('digits'), 10); // could be NaN
      const period = parseInt(queryParams.get('period'), 10); // could be NaN
      const algorithm = queryParams.get('algorithm');

      if (key) {
        this.secret_key = key;
      }

      if (digits) {
        this.digits = digits;
      }

      if (period) {
        this.period = period;
      }

      if (algorithm) {
        this.algorithm = algorithm;
      }
    }
  }
});

app.mount('#app');
