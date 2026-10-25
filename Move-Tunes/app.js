// Replace with your project details from Supabase Dashboard -> Settings -> API
const SUPABASE_URL = 'https://uolvjfuvdrspeqpzlyiz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_b3zvADI6ZsU7m9yvA_6fcA_UrJRLz5e';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('signinForm');
const statusMessage = document.getElementById('status-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  statusMessage.style.color = '#fff';
  statusMessage.textContent = 'Creating account...';

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        username: username, // Captured by your handle_new_user trigger
      },
    },
  });

  if (error) {
    statusMessage.style.color = '#ff6b6b';
    statusMessage.textContent = error.message;
    return;
  }

  statusMessage.style.color = '#51cf66';
  statusMessage.textContent = 'Account created successfully!';
  form.reset();
});