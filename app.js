const Minpush = require('@minpush/tracker/minpush-weapp').default;

App({
  minpush: new Minpush('478395936083542016'),

  onHide: function() {
    this.minpush && this.minpush.report()
  },
})
