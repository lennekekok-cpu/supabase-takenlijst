import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/+esm';
// Een publishable key mag in de browser staan. De RLS-regels beveiligen de rijen.
const db = createClient('https://hxnzeujekbizdcrqrtpe.supabase.co', 'sb_publishable_WBr_gPIvs6cF6ob4H709Dg_SKRrr6RQ');
const $ = id => document.getElementById(id);
let user = null, registering = false, generation = 0;
const message = text => { $('status').textContent = text; };
const errors = { 'Invalid login credentials':'E-mailadres of wachtwoord klopt niet.', 'Email not confirmed':'Bevestig eerst je e-mailadres via de ontvangen e-mail.', 'User already registered':'Dit e-mailadres is al geregistreerd.', 'Failed to fetch':'Geen verbinding met Supabase. Controleer je internetverbinding en probeer opnieuw.' };
function report(error) { message(errors[error.message] || `Het is niet gelukt: ${error.message}`); }
async function run(button, action) { button.disabled = true; try { await action(); } catch(e) { report(e); } finally { button.disabled = false; } }
function route(){
 const signedIn = !!user;
 $('auth').hidden = signedIn; $('tasks').hidden = !signedIn; $('logout').hidden = !signedIn;
 const target = signedIn ? '#/taken' : '#/inloggen';
 if(location.hash !== target) history.replaceState(null,'',target);
 $('account').textContent = user?.email || '';
}
window.addEventListener('hashchange', route);
async function load(){
 if(!user) return;
 const current = generation;
 const {data,error}=await db.from('tasks').select('id,title,completed,created_at').order('created_at',{ascending:false});
 if(error) throw error;
 if(current !== generation || !user) return;
 $('list').replaceChildren(); $('empty').hidden = data.length > 0;
 $('count').textContent = `${data.filter(t=>!t.completed).length} open · ${data.length} totaal`;
 for(const task of data){
  const li=document.createElement('li'), check=document.createElement('input'), title=document.createElement('span'), remove=document.createElement('button');
  check.type='checkbox';check.checked=task.completed;check.setAttribute('aria-label',`Taak afronden: ${task.title}`);
  title.textContent=task.title;title.className=task.completed?'done':'';
  remove.textContent='Verwijder';remove.setAttribute('aria-label',`Verwijder ${task.title}`);
  check.addEventListener('change',()=>run(check,async()=>{const {data:rows,error}=await db.from('tasks').update({completed:check.checked}).eq('id',task.id).select('id');if(error){check.checked=task.completed;throw error;}if(!rows.length)throw Error('Deze taak bestaat niet meer. Vernieuw je lijst.');await load();message('Wijziging opgeslagen in de database.');}));
  remove.addEventListener('click',()=>run(remove,async()=>{const {error}=await db.from('tasks').delete().eq('id',task.id);if(error)throw error;await load();message('Taak verwijderd uit de database.');}));
  li.append(check,title,remove);$('list').append(li);
 }
}
$('switch').onclick=()=>{registering=!registering;$('auth-title').textContent=registering?'Maak je eigen account':'Log in en ga aan de slag';$('submit-auth').textContent=registering?'Account aanmaken':'Inloggen';$('switch').textContent=registering?'Al een account? Inloggen':'Nog geen account? Registreren';$('password').autocomplete=registering?'new-password':'current-password';message('');};
$('auth-form').onsubmit=e=>{e.preventDefault();run($('submit-auth'),async()=>{const credentials={email:$('email').value.trim(),password:$('password').value};const {data,error}=registering?await db.auth.signUp(credentials):await db.auth.signInWithPassword(credentials);if(error)throw error;$('password').value='';message(registering&&!data.session?'Controleer je e-mail en bevestig je account. Keer daarna hier terug om in te loggen.':'Je bent ingelogd.');});};
$('add-form').onsubmit=e=>{e.preventDefault();run(e.submitter,async()=>{if(!user)throw Error('Log eerst in.');const title=$('title').value.trim();if(!title)throw Error('Vul een taak in.');const {error}=await db.from('tasks').insert({title,user_id:user.id});if(error)throw error;$('title').value='';await load();message('Je taak staat nu in Supabase. Vernieuw de pagina: hij blijft bewaard.');});};
$('refresh').onclick=()=>run($('refresh'),async()=>{await load();message('Taken opnieuw opgehaald uit de database.');});
$('logout').onclick=()=>run($('logout'),async()=>{const {error}=await db.auth.signOut();if(error)throw error;message('Je bent uitgelogd.');});
// Geen databasewerk binnen de auth-callback: dat voorkomt geblokkeerde sessie-updates.
db.auth.onAuthStateChange((_event,session)=>{generation++;user=session?.user||null;$('list').replaceChildren();route();if(user)setTimeout(()=>load().catch(report),0);});
try { const {data,error}=await db.auth.getUser();if(error && error.name!=='AuthSessionMissingError')throw error;user=data.user;route();message(user?'Je taken worden uit Supabase opgehaald.':'Log in of maak een account om te beginnen.');if(user)await load(); } catch(e){user=null;route();report(e);}
