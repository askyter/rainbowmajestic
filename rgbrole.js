const { Client, GatewayIntentBits } = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ]
})

// =============================================
// ✅ SETTINGS — edit these
// =============================================
const TOKEN = process.env.TOKEN

const RGB_ROLES = [
  {
    roleId: '1506595089546350643',   // Role yang mau di-RGB
    speed: 1,                    // Makin gede makin cepet (1-20)
  },
  // Tambah role lain kalau mau:
  // {
  //   roleId: 'YOUR_ROLE_ID_2',
  //   speed: 10,
  // },
]

const UPDATE_INTERVAL_MS = 5000  // update tiap 100ms (jangan terlalu cepet, bisa kena rate limit)
// =============================================

// Hue tracker per role
const hueMap = {}

// Convert HSV to RGB
function hsvToRgb(h, s, v) {
  let r, g, b
  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  switch (i) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q; b = v; break
    case 4: r = t; g = p; b = v; break
    case 5: r = v; g = p; b = q; break
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// Convert RGB to hex number (Discord uses number not string)
function rgbToHex(r, g, b) {
  return (r << 16) | (g << 8) | b
}

client.once('clientReady', async () => {
  console.log(`✅ RGB Role Bot online as ${client.user.tag}`)

  // Init hue for each role
  RGB_ROLES.forEach(r => { hueMap[r.roleId] = 0 })

  // Start RGB loop
  setInterval(async () => {
    for (const config of RGB_ROLES) {
      try {
        // Find the role across all guilds
        for (const guild of client.guilds.cache.values()) {
          const role = guild.roles.cache.get(config.roleId)
          if (!role) continue

          // Update hue
          hueMap[config.roleId] = (hueMap[config.roleId] + config.speed) % 360

          // Get RGB color
          const [r, g, b] = hsvToRgb(hueMap[config.roleId], 1, 1)
          const color = rgbToHex(r, g, b)

          // Update role color
          await role.setColor(color)
        }
      } catch (err) {
        // Silently ignore rate limit errors
        if (err.code !== 429) console.error('Error updating role:', err.message)
      }
    }
  }, UPDATE_INTERVAL_MS)
})

client.login(TOKEN)
