import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    console.log("Fetching existing users from auth.users...");
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();

    if (authErr) {
        console.error("Error fetching users:", authErr.message);
        process.exit(1);
    }

    const users = authData.users;
    console.log(`Found ${users.length} authenticated users.`);

    for (const user of users) {
        console.log(`Checking profile for: ${user.email}`);
        const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user.id).single();

        const targetRole = user.email === 'saurabhkirve@gmail.com' ? 'admin' : 'viewer';

        if (!profile) {
            console.log(`  -> Profile MISSING! Re-creating profile for ${user.email} with role '${targetRole}'...`);
            const { error: insertErr } = await supabase.from('profiles').insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url || null,
                role: targetRole
            }]);
            if (insertErr) console.error("    -> Insert Error:", insertErr.message);
            else console.log("    -> Success!");
        } else if (user.email === 'saurabhkirve@gmail.com' && profile.role !== 'admin') {
            console.log(`  -> Profile exists but role is '${profile.role}'. Upgrading to 'admin'...`);
            const { error: updateErr } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
            if (updateErr) console.error("    -> Update Error:", updateErr.message);
            else console.log("    -> Upgrade Success!");
        } else {
            console.log(`  -> Profile OK. (Role: ${profile.role})`);
        }
    }

    console.log("Finish re-syncing auth profiles.");
}

run();
