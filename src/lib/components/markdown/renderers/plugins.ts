import { marked } from 'marked'
import markedLinkifyIt from 'marked-linkify-it'

export const spoilerPlugin = {
  name: 'spoiler',
  level: 'block',
  start(src: string) {
    return src.match(/^:::/)?.index
  },
  tokenizer(src: string, tokens: marked.TokensList) {
    const rule = /^::: spoiler (.+)\n([\s\S]*?)\n:::/
    const match = rule.exec(src)
    if (match) {
      return {
        type: 'spoiler',
        raw: match[0],
        title: match[1].trim(),
        text: match[2].trim(),
      }
    }
  },
  renderer(token: any) {
    return `
      <details>
        <summary>${marked.parseInline(token.title)}</summary>
        ${marked.parse(token.text)}
      </details>
    `
  },
}

export const linkify = markedLinkifyIt(
  {
    '!': {
      validate: function (text: any, pos: any, self: any) {
        var tail = text.slice(pos)

        if (!self.re.community) {
          self.re.community = new RegExp(
            /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z]{2,63})/i
          )
        }
        if (self.re.community.test(tail)) {
          // Linkifier allows punctuation chars before prefix,
          // but we additionally disable `@` ("@@mention" is invalid)
          if (pos >= 2 && tail[pos - 2] === '!') {
            return false
          }
          return tail.match(self.re.community)![0].length
        }
        return 0
      },
      normalize: function (match: any) {
        let prefix = match.url
        prefix = prefix.startsWith('c/') ? prefix.slice(2) : prefix.slice(1)

        match.url = `/c/${prefix}`
      },
    },
    '@': {
      validate: function (text: any, pos: any, self: any) {
        var tail = text.slice(pos)

        if (!self.re.user) {
          self.re.user = new RegExp(
            /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z]{2,63})/i
          )
        }
        if (self.re.user.test(tail)) {
          // Linkifier allows punctuation chars before prefix,
          // but we additionally disable `@` ("@@mention" is invalid)
          if (pos >= 2 && tail[pos - 2] === '!') {
            return false
          }
          return tail.match(self.re.user)![0].length
        }
        return 0
      },
      normalize: function (match: any) {
        let prefix = match.url
        prefix = prefix.startsWith('u/') ? prefix.slice(2) : prefix.slice(1)

        match.url = `/u/${prefix}`
      },
    },
  },
  {}
)

const regexes = {
  post: /^https:\/\/([a-zA-Z0-9.-]+)\/post\/(\d+)$/i,
  comment: /^https:\/\/([a-zA-Z0-9.-]+)\/comment\/(\d+)$/i,
  user: /^https:\/\/([a-zA-Z0-9.-]+)(\/u\/)([a-zA-Z0-9.-_]+)$/i,
  community: /^https:\/\/([a-zA-Z0-9.-]+)(\/c\/)([a-zA-Z0-9.-_]+)$/i,
}

/**
 * Convert links to photon links
 */
export const photonify = (link: string) => {
  if (regexes.post.test(link)) {
    const match = link.match(regexes.post)
    if (!match) return
    return `/post/${match?.[1]}/${match?.[2]}`
  }
  if (regexes.comment.test(link)) {
    const match = link.match(regexes.comment)
    if (!match) return
    return `/comment/${match?.[1]}/${match?.[2]}`
  }
  if (regexes.user.test(link)) {
    const match = link.match(regexes.user)
    if (!match) return
    return `/u/${match?.[3]}@${match?.[1]}`
  }
  if (regexes.community.test(link)) {
    const match = link.match(regexes.community)
    if (!match) return
    return `/c/${match?.[3]}@${match?.[1]}`
  }
}
