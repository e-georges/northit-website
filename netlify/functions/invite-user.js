// Netlify Function — invite-user.js
// Chemin dans le repo : netlify/functions/invite-user.js
// Variables d'env à configurer dans Netlify > Site > Environment variables :
//   SUPABASE_URL         → https://muygrrpnrfppjdgcbobx.supabase.co
//   SUPABASE_SERVICE_KEY → votre clé secrète (sb_secret_...)
//   SITE_URL             → https://northit.fr

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const SUPABASE_URL  = process.env.SUPABASE_URL;
  const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY;
  const SITE_URL      = process.env.SITE_URL || 'https://northit.fr';

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Configuration serveur manquante.' }) };
  }

  // 1. Vérifier que l'appelant est bien connecté
  const authHeader = event.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Non authentifié.' }) };
  }

  // 2. Récupérer l'utilisateur depuis le token
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'Authorization': `Bearer ${token}`, 'apikey': SERVICE_KEY }
  });
  if (!userRes.ok) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Token invalide.' }) };
  }
  const { id: callerId } = await userRes.json();

  // 3. Vérifier que l'appelant est formateur
  const roleRes = await fetch(
    `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${callerId}&role=eq.formateur&select=role`,
    { headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY } }
  );
  const roles = await roleRes.json();
  if (!Array.isArray(roles) || roles.length === 0) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Accès réservé au formateur.' }) };
  }

  // 4. Parser le body
  let email, full_name, role;
  try {
    const body = JSON.parse(event.body);
    email     = body.email?.trim();
    full_name = body.full_name?.trim();
    role      = body.role || 'apprenant';
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corps de requête invalide.' }) };
  }

  if (!email || !full_name) {
    return { statusCode: 400, body: JSON.stringify({ error: 'email et full_name sont requis.' }) };
  }

  // 5. Inviter l'utilisateur via Supabase Admin API
  const inviteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/invite`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      data: { full_name },
      redirect_to: `${SITE_URL}/espace-apprenant.html`
    })
  });

  const inviteData = await inviteRes.json();
  if (!inviteRes.ok) {
    return { statusCode: 400, body: JSON.stringify({ error: inviteData.msg || inviteData.message || 'Erreur invitation.' }) };
  }

  // 6. Ajouter le rôle dans user_roles
  const newUserId = inviteData.id;
  if (newUserId) {
    await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ user_id: newUserId, role, full_name })
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: `Invitation envoyée à ${email}` })
  };
};
