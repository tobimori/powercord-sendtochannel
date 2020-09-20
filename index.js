const { Plugin } = require('powercord/entities')
const { getModule, React, channels: { getChannelId } } = require('powercord/webpack')
const { inject, uninject } = require("powercord/injector")

module.exports = class SendToChannel extends Plugin {
  startPlugin() {
    this.injectSendToChannel()
  }

  getSelectedText(args) {
    let text = window.getSelection().toString()
    if (!text) text = args[0].message.content
    return text
  }

  async sendMessage(text) {
    const messageEvents = await getModule(['sendMessage'])

    let messageArgs = {
      content: text,
      invalidEmojis: [],
      tts: false,
      validNonShortcutEmojis: []
    }
    await messageEvents.sendMessage(getChannelId(), messageArgs)
  }

  async injectSendToChannel() {
    const nativeTextMenu = await getModule(
      (m) => m.default && m.default.displayName === 'NativeTextContextMenu'
    )
    const nativeLinkMenu = await getModule(
      (m) => m.default && m.default.displayName === 'NativeLinkContextMenu'
    )
    const messageMenu = await getModule(
      (m) => m.default && m.default.displayName === 'MessageContextMenu'
    )
    const menu = await getModule(["MenuItem"])

    inject('SendToChannelNativeText', nativeTextMenu, 'default', (args, res) => {
      // console.log(args, res)
      res.props.children[0].props.children.push(
        React.createElement(menu.MenuItem, {
          name: 'Send to Channel',
          id: 'SendToChannelContextLink',
          label: 'Send to Channel',
          action: () => this.sendMessage(args[0].text),
        })
      )

      return res
    })

    inject('SendToChannelNativeLink', nativeLinkMenu, 'default', (args, res) => {
      // console.log(args, res)
      res.props.children.props.children.push(
        React.createElement(menu.MenuItem, {
          name: 'Send Link to Channel',
          id: 'SendToChannelContextLink',
          label: 'Send Link to Channel',
          action: () => this.sendMessage(args[0].href),
        })
      )

      return res
    })

    inject('SendToChannelMessageMenu', messageMenu, 'default', (args, res) => {
      console.log(args, res)
      res.props.children[2].props.children.splice(11, 0,
        React.createElement(menu.MenuItem, {
          name: 'Send to Channel',
          id: 'SendToChannelContextLink',
          label: 'Send to Channel',
          action: () => this.sendMessage(this.getSelectedText(args)),
        })
      )

      return res
    })
  }

  pluginWillUnload() {
    uninject('SendToChannelNativeText')
    uninject('SendToChannelNativeLink')
    uninject('SendToChannelMessageMenu')
  }
};