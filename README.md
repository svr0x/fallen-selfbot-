<div align="center">

<img src="https://file.garden/ai5wJPrOLRCONDDM/fallen.png" alt="fallen Logo" width="200" height="200">

# ⚡ fallen Selfbot

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=28&duration=4000&pause=1000&color=FF0000&center=true&vCenter=true&width=600&lines=fallen+cute+lang;pogi%2C+moreno%2C+maalaga%2C+cute" alt="Typing SVG" />

[![Discord Server](https://img.shields.io/badge/Discord-Join%20Server-7289da?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/DWxCXT8ch5)
[![GitHub stars](https://img.shields.io/github/stars/svr0x/fallen-selfbot-?color=yellow&style=for-the-badge)](https://github.com/svr0x/fallen-selfbot-/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/svr0x/fallen-selfbot-?color=green&style=for-the-badge)](https://github.com/svr0x/fallen-selfbot-/network)
[![GitHub issues](https://img.shields.io/github/issues/svr0x/fallen-selfbot-?color=red&style=for-the-badge)](https://github.com/svr0x/fallen-selfbot-/issues)
[![License](https://img.shields.io/github/license/svr0x/fallen-selfbot-?color=blue&style=for-the-badge)](LICENSE)

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

---

## 🚨 **IMPORTANT DISCLAIMER**

> **⚠️ WARNING: Selfbots violate Discord's Terms of Service**
> 
> - Selfbots can result in **account termination only when used extensively**
> - Use at your **own risk** and responsibility
> - We are **not responsible** for any consequences
> - Consider using **alternative accounts** for testing
> - Use **responsibly** and avoid spam or excessive automation

---

## 📖 **About fallen**

**fallen** is an experimental, open-source, multifunctional Discord selfbot built with modern JavaScript and Discord.js-selfbot-v13. It features comprehensive command handling, advanced task management, and a wide array of utilities designed for power users.

1### ✨ **Key Features**

<div align="center">

| 🎯 **Core Features** | 🛠️ **Advanced Tools** | 🎮 **Fun & Games** |
|:---:|:---:|:---:|
| 120+ Commands | Task Management | Mini Games |
| Rate Limit Protection | Relationship Logging | ASCII Art Generator |
| Anti-Crash System | Nitro Sniper | 8Ball & Dice |
| Graceful Shutdown | Voice Channel Tools | Fake Typing |
| Custom Prefix | Rich Presence | Clownify Text |

</div>

---

## 🚀 **Quick Start**


### 📋 **Prerequisites**

- **Node.js** v20 or higher
- **npm** or **yarn** package manager
- **Discord account** 

### 📥 **Installation**

#### **Option 1: Git Clone (Recommended)**
```bash
# Clone the repository
git clone https://github.com/svr0x/fallen-selfbot-.git

# Navigate to project directory
cd fallen

# Install dependencies
npm install
```

#### **Option 2: Download ZIP (If git clone fails)**
If `git clone` doesn't work for you:
1. **Go to** the GitHub repository: https://github.com/svr0x/fallen-selfbot-
2. **Click** the green **"Code"** button at the top
3. **Select** "Download ZIP"
4. **Extract** the ZIP file to your desired location
5. **Open** the extracted folder in your terminal/command prompt
6. **Run** `npm install` to install dependencies

**Both methods work the same way!** 🎯

### ⚙️ **Configuration**

1. **Get your Discord token** - See [📖 Token Guide](docs/GET_TOKEN.md)
2. **Edit `config.yaml`**:

```yaml
selfbot:
  token: "YOUR_DISCORD_TOKEN_HERE"  # Replace with your token
  prefix: "+"                      # Your command prefix
  status: "dnd"                    # Your status (dnd recommended)
```

3. **Start the selfbot**:

```bash
npm start
# or
node index.js
```

---

## 📚 **Command Categories**

<details>
<summary><b>🤖 AI Commands</b></summary>

- `+ask` - Ask AI questions using Groq API

</details>

<details>
<summary><b>🎉 Fun Commands</b></summary>

- `+8ball` - Magic 8-ball responses
- `+ascii` - Convert text to ASCII art
- `+choose` - Choose between options
- `+clownify` - Clownify your text 🤡
- `+coinflip` - Flip a coin
- `+dice` - Roll dice
- `+emojify` - Convert text to emojis
- `+fact` - Random facts
- `+gay` - Gay percentage calculator
- `+iq` - IQ calculator
- `+mock` - mOcK tExT lIkE tHiS
- `+pp` - PP size calculator
- `+reverse` - Reverse text
- `+rps` - Rock Paper Scissors

</details>

<details>
<summary><b>🔧 General Commands</b></summary>

- `+help` - Show help menu
- `+ping` - Check bot latency
- `+avatar` - Get user avatar
- `+banner` - Get user banner
- `+userinfo` - Get user information
- `+serverinfo` - Get server information
- `+afk` - Set AFK status
- `+fakehack` - Fake hacking animation
- `+faketyping` - Fake typing indicator
- `+nitrosniper` - Toggle nitro sniping
- `+tokencheck` - Check token validity

</details>

<details>
<summary><b>🛡️ Moderation Commands</b></summary>

- `+ban` - Ban a user
- `+kick` - Kick a user
- `+mute` - Mute a user
- `+purge` - Delete messages
- `+lock` - Lock a channel
- `+slowmode` - Set channel slowmode
- `+steal` - Steal emojis
- `+role` - Manage user roles

</details>

<details>
<summary><b>🎮 Server Management</b></summary>

- `+clone` - Clone channels/servers
- `+nuke` - Nuke server (DANGEROUS)
- `+massnick` - Mass nickname change
- `+lockall` - Lock all channels
- `+leave` - Leave server
- `+snipe` - View deleted messages

</details>

<details>
<summary><b>🎭 Troll Commands</b></summary>

- `+spam` - Spam messages
- `+stalk` - Stalk users
- `+cpack` - Send random insults [chatpack]
- `+ghostping` - Ghost ping users

</details>

<details>
<summary><b>🔧 Utility Commands</b></summary>

- `+backup` - Backup server data
- `+prefix` - Change command prefix
- `+reload` - Reload commands
- `+status` - Change bot status
- `+rpc` - Rich presence control

</details>

---

## 🎨 **Screenshots**

<div align="center">

### 📋 **Help Categories**


![Help Categories](https://file.garden/ai5wJPrOLRCONDDM/helpcategories.jpg)


### ⚡ **Command Execution**


![Commands](https://file.garden/ai5wJPrOLRCONDDM/execution.png)


### 📱 **Command Categories**


![Categories](https://file.garden/ai5wJPrOLRCONDDM/categories.jpg)


</div>

---

## 📁 **Project Structure**

```
fallen/
├── 📁 commands/          # Command modules (organized by category)
│   ├── 🤖 AI/           # AI-powered commands
│   ├── 🎉 fun/          # Fun and entertainment commands
│   ├── 🔧 general/      # General utilities and info commands
│   ├── 🛡️ moderation/   # Server moderation tools
│   ├── 🎮 server/       # Server management commands
│   ├── 🎭 troll/        # Troll and prank commands
│   ├── 💥 misc/         # Miscellaneous utilities
│   ├── 📱 media/        # Media and image commands
│   ├── 🔞 nsfw/         # 18+ content commands
│   └── 📊 settings/     # Bot configuration commands
│   └── 🎮 status/       # Status and Rich Presence commands
├── 📁 events/           # Discord event handlers
│   └── 📁 relationship/ # Relationship/friend event handlers
├── 📁 handlers/         # Core system handlers
├── 📁 utils/            # Utility functions and managers
├── 📁 docs/             # Documentation files
├── ⚙️ config.yaml       # Main configuration file
├── 🎨 rpc.yml          # Rich Presence configuration
├── 📄 package.json      # Project dependencies
├── 🚀 index.js         # Main entry point
├── 🔰 start.bat        # Windows startup script
└── 📜 LICENSE          # MIT License
```

---

## 🔧 **Advanced Configuration**

<details>
<summary><b>🎨 Rich Presence Setup</b></summary>

**Full RPC Guide:** [docs/RPC.md](docs/RPC.md)

```yaml
# Rich Presence configuration in rpc.yml
rpc:
  enabled: true
  application_id: "1306468377539379241"
  default:
    type: "PLAYING"
    name: "fallen Selfbot"
    details: "cute lang"
    state: "github.com/svr0x"
    assets:
      large_image: "fallen"
      large_text: "fallen Selfbot"
      small_image: "thunder"
      small_text: "github.com/svr0x"
    buttons:
      - label: "GitHub"
        url: "https://github.com/svr0x/fallen-selfbot-"
```

**Commands:** `+rpc enable`, `+rpc setType`, `+rpc setLargeImage`, etc.

</details>

<details>
<summary><b>🤖 AI Integration</b></summary>

```yaml
ai:
  groq_api_key: "your_groq_api_key_here"  # Get free at console.groq.com
```

**Command:** `+ask` - Ask AI questions using Groq API

</details>

<details>
<summary><b>🔊 Voice Channel Settings</b></summary>

```yaml
vc_command:
  mute: true        # Auto-mute when joining voice
  deafen: true      # Auto-deafen when joining voice
  auto_reconnect: true
  reconnect_delay: 5
  max_attempts: 3
```

**Commands:** `+joinVC`, `+leaveVC`, voice moderation commands

</details>

<details>
<summary><b>💥 Server Protection Settings</b></summary>

```yaml
# Anti-nuke protection settings
nuke:
  nuke_message: "@everyone fallen was here!"
  server_name: "fallen owns this server!"
  channels:
    - "Nuked by self"
    - "crushed"
```

**⚠️ WARNING:** These are for the dangerous `+nuke` command - use responsibly!

</details>

<details>
<summary><b>🔞 NSFW Content</b></summary>

```yaml
nsfw:
  enabled: false  # Enable 18+ content commands
```

**Commands:** Various NSFW commands (18+ only)

</details>

<details>
<summary><b>🎭 Troll Commands</b></summary>

```yaml
bad_phrases:
  enabled: true
  phrases:
    - "Your custom phrase here"
    - "Another troll phrase"
```

**Commands:** `+badreply`, `+spam`, `+stalk`, etc.
**⚠️ Use responsibly!**

</details>

---

## 🛠️ **Development**

### 🏗️ **Building from Source**

```bash
# Clone repository
git clone https://github.com/svr0x/fallen-selfbot-.git
cd fallen

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### 🧪 **Testing**

```bash
# Run tests
npm test

# Check code style
npm run lint
```

### 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch
3. **Commit** your changes
4. **Push** to the branch
5. **Open** a Pull Request

---

## 📖 **Documentation**

| 📄 **Guide** | 📝 **Description** |
|:---|:---|
| [🔑 Getting Your Token](docs/GET_TOKEN.md) | Step-by-step token extraction guide |
| [⚙️ Configuration Guide](docs/CONFIG_GUIDE.md) | Complete config.yaml setup tutorial |
| [📱 Android Setup](docs/ANDROID.md) | Mobile device setup instructions |
| [🎨 Image Generation](docs/imagegen-guide.md) | AI image generation guide |
| [🎮 Rich Presence Guide](docs/RPC.md) | Complete RPC setup and customization guide |

---

## 🆘 **Support & Community**

<div align="center">

[![Discord Server](https://img.shields.io/badge/Discord-Join%20Server-7289da?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/DWxCXT8ch5)
[![GitHub Issues](https://img.shields.io/badge/GitHub-Report%20Issue-red?style=for-the-badge&logo=github&logoColor=white)](https://github.com/svr0x/fallen-selfbot-/issues)

</div>

### 💬 **Get Help & Share Ideas**

- 🎮 **Discord Server**: [Join our community](https://discord.gg/DWxCXT8ch5) - **I'm waiting for your suggestions for more features!**
- 🐛 **Bug Reports & Error Fixing**: I'm available on Discord at our support server for guidance
- 💡 **Feature Requests**: Share your ideas with me on Discord - I love hearing from users!
- 📧 **Direct Contact**: `fallen` on Discord
- ⭐ **Reviews**: I'm waiting for your reviews and feedback on our Discord server!

---

## 📊 **Statistics**

<div align="center">

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=svr0x&show_icons=true&theme=tokyonight&hide_border=true)

![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=svr0x&layout=compact&theme=tokyonight&hide_border=true)

</div>

---

## 🏆 **Achievements**

- ⭐ **130+** Commands 
- 🚀 **Advanced** task management system
- 🛡️ **Robust** error handling and anti-crash
- 🎯 **Rate limit** protection
- 🔄 **Graceful** shutdown handling
- 📱 **Cross-platform** compatibility

## 📊 **Development Statistics**

<div align="center">

| 📈 **Metric** | 📊 **Value** |
|:---:|:---:|
| **⏱️ Total Development Time** | **2.5 Months** |
| **📝 Lines of Code** | **20,234** |
| **🎯 Commands Implemented** | **120+** |
| **📁 Files Created** | **100+** |

</div>

---

## 🙏 **Credits & Acknowledgments**

Special thanks to the amazing services and contributors that make fallen possible:

- **🎨 [Pollinations.ai](https://pollinations.ai/)** - For providing free AI image generation API that powers our image commands
- **💻 [Zencoder](https://zencoder.ai/)** - For writing easy-to-understand comments inside the code, making it developer-friendly for other contributors
- **🌟 Community** - All the users who provide feedback, suggestions, and support on our Discord server

---

## 📜 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ⚖️ **Legal Notice**

> **DISCLAIMER**: This project is for **educational purposes only**. Selfbots violate Discord's Terms of Service and may result in account termination. The developers are not responsible for any consequences arising from the use of this software. Use at your own risk and consider using alternative accounts.

---

## 💝 **Support the Project**

If you find fallen useful, please consider supporting the project:

<div align="center">

[![Star on GitHub](https://img.shields.io/badge/⭐-Star%20on%20GitHub-yellow?style=for-the-badge)](https://github.com/svr0x/fallen-selfbot-)
[![Fork on GitHub](https://img.shields.io/badge/🍴-Fork%20on%20GitHub-green?style=for-the-badge)](https://github.com/svr0x/fallen-selfbot-/fork)

**Show your support by giving this project a ⭐ star!**

**I'm also waiting for your reviews and feedback on our Discord server!**

</div>

---

<div align="center">

### 🌟 **Made with ❤️ by [svr0x](https://github.com/svr0x) in the Philippines 🇵🇭**

**⚡ fallen - selfbot  ⚡**

[![Visitors](https://visitor-badge.laobi.icu/badge?page_id=svr0x.fallen-selfbot-)](https://github.com/svr0x/fallen-selfbot-)

</div>
