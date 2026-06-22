<meta name="google-site-verification" content="9xq3Y1fi1dBMRY_Lr5XejqqVdvtjv5vlWnmg8dfxdqs" />
<div align="center">

<img src="https://file.garden/ai5wJPrOLRCONDDM/fallen.png" width="180">

<br>

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=32&duration=4000&pause=1000&color=FF0000&center=true&vCenter=true&width=600&lines=fallen+cute+lang;pogi%2C+moreno%2C+maalaga%2C+cute" alt="Typing SVG" />

<br>

```
         ── フォールン ──
           CUTE LANG 
```

[![Discord](https://img.shields.io/badge/Discord-Join-7289da?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/DWxCXT8ch5)
[![Stars](https://img.shields.io/github/stars/svr0x/fallen-selfbot-?color=red&style=flat-square)](https://github.com/svr0x/fallen-selfbot-/stargazers)
[![Forks](https://img.shields.io/github/forks/svr0x/fallen-selfbot-?color=grey&style=flat-square)](https://github.com/svr0x/fallen-selfbot-/network)
[![License](https://img.shields.io/github/license/svr0x/fallen-selfbot-?color=darkred&style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-333?style=flat-square&logo=nodedotjs)](https://nodejs.org/)

</div>

---

```
⚠  selfbots violate discord's terms of service.
   use at your own risk. we are not responsible for any consequences.
   consider testing on alt accounts only.
```

---

## `> about`

**fallen** is a free, open-source Discord selfbot built for mobile and desktop. runs on Termux — no PC needed. 130+ commands covering moderation, server tools, fun, AI, multi-token hosting, and more.

built in 1 month. built for mobile users.

---

## `> screenshots`

<div align="center">

![Help Categories](https://file.garden/ai5wJPrOLRCONDDM/helpcategories.jpg)

![Execution](https://file.garden/ai5wJPrOLRCONDDM/execution.png)

![Categories](https://file.garden/ai5wJPrOLRCONDDM/categories.jpg)

</div>

---

## `> install`

```bash
git clone https://github.com/svr0x/fallen-selfbot-.git
cd fallen-selfbot-
npm install
```

then edit `config.yaml`:

```yaml
selfbot:
  token: "YOUR_DISCORD_TOKEN_HERE"
  prefix: "+"
  status: "dnd"
```

then run:

```bash
node index.js
```

> get your token: [docs/GET_TOKEN.md](docs/GET_TOKEN.md)

---

## `> commands`

| category | count | highlights |
|---|---|---|
| 🤖 AI | 1 | `+ask` |
| 🎉 Fun | 14 | `+8ball` `+ascii` `+clownify` `+iq` `+pp` |
| 🔧 General | 12 | `+ping` `+avatar` `+userinfo` `+nitrosniper` |
| 🛡️ Moderation | 8 | `+ban` `+kick` `+purge` `+steal` |
| 🎮 Server | 8 | `+clone` `+nuke` `+massnick` `+snipe` |
| 🎭 Troll | 4 | `+spam` `+stalk` `+ghostping` |
| 💥 Misc | 10 | `+full_nuke` `+webhook` `+ban_all` |
| 📱 Media | 2 | `+imagegen` |
| 🔞 NSFW | 9 | 18+ content |
| 📊 Settings | 6 | `+prefix` `+status` `+reload` |
| 🌐 Hosting | 7 | `+hosted` `+alts` `+hts` |

<details>
<summary>full command list</summary>

**fun** — `+8ball` `+ascii` `+choose` `+clownify` `+coinflip` `+dice` `+emojify` `+fact` `+gay` `+iq` `+mock` `+pp` `+reverse` `+rps`

**general** — `+help` `+ping` `+avatar` `+banner` `+userinfo` `+serverinfo` `+afk` `+faketyping` `+nitrosniper` `+tokencheck` `+fakehack` `+autoreact`

**moderation** — `+ban` `+kick` `+mute` `+purge` `+lock` `+slowmode` `+steal` `+role`

**server** — `+clone` `+nuke` `+massnick` `+lockall` `+leave` `+snipe` `+serverinfo` `+rolelists`

**troll** — `+spam` `+stalk` `+ghostping` `+spack`

**misc** — `+full_nuke` `+channels_nuke` `+roles_nuke` `+ban_all` `+kick_all` `+webhook` `+webhookSpam` `+ghost_ping` `+leave_all` `+remove_all_friends`

**hosting** — `+hosted <token> <prefix>` `+hosted stop <token>` `+hosted list` `+hts` `+alts <token>` `+alts list` `+alts remove`

</details>

---

## `> config`

<details>
<summary>rich presence</summary>

```yaml
rpc:
  enabled: true
  application_id: "YOUR_APP_ID"
  default:
    type: "PLAYING"
    name: "fallen Selfbot"
    details: "Never Rise. Only Fall."
    state: "github.com/svr0x"
    assets:
      large_image: "https://file.garden/ai5wJPrOLRCONDDM/fallen.png"
      large_text: "fallen Selfbot"
```

guide: [docs/RPC.md](docs/RPC.md)

</details>

<details>
<summary>AI integration</summary>

```yaml
ai:
  groq_api_key: "your_key_here"
```

free key at [console.groq.com](https://console.groq.com)

</details>

<details>
<summary>voice channel</summary>

```yaml
vc_command:
  mute: true
  deafen: true
  auto_reconnect: true
```

</details>

---

## `> docs`

| file | description |
|---|---|
| [GET_TOKEN.md](docs/GET_TOKEN.md) | how to get your discord token |
| [CONFIG_GUIDE.md](docs/CONFIG_GUIDE.md) | full config.yaml breakdown |
| [ANDROID.md](docs/ANDROID.md) | termux setup guide |
| [imagegen-guide.md](docs/imagegen-guide.md) | AI image generation |
| [RPC.md](docs/RPC.md) | rich presence setup |

---

## `> support`

[![Discord](https://img.shields.io/badge/Discord-Join%20Server-7289da?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/DWxCXT8ch5)
[![Issues](https://img.shields.io/badge/GitHub-Report%20Issue-red?style=for-the-badge&logo=github)](https://github.com/svr0x/fallen-selfbot-/issues)

direct contact: `fallen` on Discord

---

## `> stats`

[![GitHub Stats](https://github-readme-stats.vercel.app/api?username=svr0x&show_icons=true&theme=tokyonight&hide_border=true)](https://github.com/svr0x)
[![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=svr0x&layout=compact&theme=tokyonight&hide_border=true)](https://github.com/svr0x)

---

## `> license`

MIT — [LICENSE](LICENSE)

> this project is for educational purposes only. selfbots violate discord's tos. use at your own risk.

---

<div align="center">

**made with ❤️ by [svr0x](https://github.com/svr0x) 🇵🇭**

```
⚡ fallen — be happy with you have while working for what you want ⚡
```

[![Visitors](https://visitor-badge.laobi.icu/badge?page_id=svr0x.fallen-selfbot-)](https://github.com/svr0x/fallen-selfbot-)

</div>
