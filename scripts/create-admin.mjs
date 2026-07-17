const secretKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

const requiredVariables = ['NEXT_PUBLIC_SUPABASE_URL', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']

for (const name of requiredVariables) {
  const value = process.env[name]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error('Missing required environment variable: ' + name)
  }
}

if (typeof secretKey !== 'string' || secretKey.trim().length === 0) {
  throw new Error(
    'Missing required environment variable: SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY)',
  )
}

const originalWarn = console.warn
let supabaseModule

try {
  console.warn = () => {}
  supabaseModule = await import('@supabase/supabase-js')
} finally {
  console.warn = originalWarn
}

const { createClient } = supabaseModule
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.trim()
const email = process.env.ADMIN_EMAIL.trim()
const password = process.env.ADMIN_PASSWORD

const supabase = createClient(supabaseUrl, secretKey.trim(), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function findUserByEmail(targetEmail) {
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    })

    if (error) {
      throw error
    }

    const user = data.users.find(
      ({ email: candidate }) =>
        candidate?.toLocaleLowerCase() === targetEmail.toLocaleLowerCase(),
    )

    if (user) {
      return user
    }

    if (data.nextPage === null) {
      return null
    }

    page = data.nextPage
  }
}

let user = await findUserByEmail(email)

if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    user = await findUserByEmail(email)
    if (!user) {
      throw error
    }
  } else {
    user = data.user
  }
}

if (!user) {
  throw new Error('Admin user could not be created or found')
}

const { error: allowlistError } = await supabase
  .from('app_admins')
  .upsert({ user_id: user.id }, { onConflict: 'user_id' })

if (allowlistError) {
  throw allowlistError
}

console.log('Admin account ready: ' + email)
