const { Client, GatewayIntentBits } = require('discord.js')

const http = require('http')
http.createServer((req, res) => res.end('ok')).listen(process.env.PORT || 3000)

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})

const TOKEN = process.env.TOKEN

const ROLE_ID = '1506595089546350643'
let hue = 0

function hsvToRgb(h, s, v) {
  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s)
  const vals = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]]
  return vals[i].map(x => Math.round(x * 255))
}

function rgbToHex(r, g, b) { return (r << 16) | (g << 8) | b }

async function updateColor() {
  try {
    for (const guild of client.guilds.cache.values()) {
      const role = guild.roles.cache.get(ROLE_ID)
      if (!role) continue
      hue = (hue + 40) % 360
      const [r, g, b] = hsvToRgb(hue, 1, 1)
      await role.setColor(rgbToHex(r, g, b))
      console.log(`🎨 Color updated — hue: ${hue}`)
    }
  } catch (err) {
    console.log('⚠️ Error:', err.message)
  }
  // Schedule next update regardless of error
  setTimeout(updateColor, 30000)
}

client.once('clientReady', () => {
  console.log(`✅ RGB Bot online as ${client.user.tag}`)
  setTimeout(updateColor, 5000)
})

client.login(TOKEN)
