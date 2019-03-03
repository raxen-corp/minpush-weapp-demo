const Minpush = require('@minpush/tracker/minpush-weapp').default;

App({
  minpush: new Minpush('YOUR_TRACKER_ID'),

  onHide: function() {
    this.minpush && this.minpush.report()
  },
})
