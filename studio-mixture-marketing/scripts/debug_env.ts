console.log('Environment variables starting with SANITY_:')
Object.keys(process.env)
  .filter((key) => key.startsWith('SANITY_'))
  .forEach((key) => console.log(`${key}: ${key.includes('TOKEN') ? '***' : process.env[key]}`))
