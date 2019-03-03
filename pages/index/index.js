/**
 * 获取 App 的实例
 */
const app = getApp()

Page({
  /**
   * @private {string}  存放 `wx.login` 获得 code，用于后续的授权登录 API 交互。
   */
  _loginCode: null,

  /**
   * @private {number}  存放 `wx.login` 获得 code 的最后时间。
   */
  _loginCodeExpiredAt: 0,

  // 界面用数据初始化
  data: {
    userInfo: null,
    buttonText: '登录',
  },

  /**
   * 在打开页面的时候调用 `wx.login` 获取 code
   */
  onLoad: function() {
    wx.login({
      success: (res) => {
        this._loginCode = res.code
        this._loginCodeExpiredAt = +(new Date) / 1000 + 300
      }
    })
  },

  /**
   * 处理登录按钮的 tap 事件，用于尝试进行授权登录
   */
  onRequestLogin: function() {
    // 如果已经存在登录信息，提示已经进行过授权，并且进行 FormID 的上报。
    if (this.data.userInfo) {
      wx.showToast({
        icon: 'none',
        title: '你已经进行过授权登录',
      })

      // 这里的 FormID 上报操作是可选的，在这里插入这行代码的原因是便于测试
      app.minpush.report()
    } else {
      // 按钮的 `bindtap` 会在 `bindgetuserinfo` 之前执行，并且后者会有一定的延迟，
      // 因此在用户点击登录按钮后，立即提示登录中，避免不必要的多次点击。
      wx.showToast({
        icon: 'loading',
        mask: true,
      })
    }
  },

  /**
   * 处理用户授权成功事件的回调函数
   */
  onRequestUserInfo: function(evt) {
    // 如果此前已经获得用户信息，跳过后续流程
    if (this.data.userInfo) {
      wx.hideToast()
      return
    }

    let userInfo = evt.detail && evt.detail.userInfo || {}

    // 下面 `endpointUrl` 填写你自己的微信授权 API 地址，必须返回 openId。
    let endpointUrl = ''
    if (!endpointUrl) {
      wx.hideToast()
      wx.showModal({
        title: '注意',
        content: '请先修改源码中的 endpointUrl 为您的微信登录授权 API 地址',
        showCancel: false,
        confirmText: '知道了',
      })
      return
    }

    // 确认是否已经取得了 code；且 code 有效时间为五分钟，先进行检查 code 是否有效
    const now = +(new Date) / 1000
    if (this._loginCode && (this._loginCodeExpiredAt - now) < 300) {
      wx.request({
        url:  endpointUrl,
        data: { code: this._loginCode },
        success: (resp) => {
          // 注意：这一步在实际中也是必须的，服务器解密出用户的 openId 和 unionId，赋值到
          // 前面获取到的 userInfo 之中。赋值时请注意大小写。
          userInfo.openId = resp.data.openid
          userInfo.unionId = resp.data.unionId

          // 告知 SDK 上报 FormID 时的用户信息。注意必须设置这一步；否则收集到的 FormID 将
          // 不会进行上报。
          app.minpush && app.minpush.setUserInfo(userInfo)

          // 其他处理。
          this._loginCode = null
          this._loginCodeExpiredAt = 0

          this.setData({userInfo: userInfo, buttonText: '上报'})
          wx.hideToast()
          wx.showModal({
            title: '登录成功',
            content: `您好，${userInfo.nickName}`,
            showCancel: false,
          })
        }
      })
    }
  },
})
