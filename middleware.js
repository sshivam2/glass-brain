// middleware.js — production: inject disable-devtool + immediate DOM wipe on detection
import { NextResponse } from 'next/server';

const INTERNAL_HEADER = 'x-mw-internal';

function safeJsonParse(s){ try { return JSON.parse(s); } catch { return null; } }
function base64UrlDecode(input){
  if(!input||typeof input!=='string') return null;
  input = input.replace(/-/g,'+').replace(/_/g,'/');
  const pad = input.length % 4; if(pad) input += '='.repeat(4-pad);
  try { if (typeof globalThis.atob === 'function') return globalThis.atob(input); if (typeof Buffer !== 'undefined') return Buffer.from(input,'base64').toString('utf8'); } catch {}
  return null;
}
function jwtIsExpired(token){
  if(!token||typeof token!=='string') return false;
  const parts = token.split('.'); if(parts.length!==3) return false;
  const payload = base64UrlDecode(parts[1]); if(!payload) return false;
  try{ const obj = JSON.parse(payload); return !!obj.exp && Math.floor(Date.now()/1000) >= obj.exp; } catch { return false; }
}

const CDN = 'https://cdn.jsdelivr.net/npm/disable-devtool@0.3.9/disable-devtool.min.js';
const UNAUTHORIZED_PATH = (typeof process !== 'undefined' && process.env && process.env.UNAUTHORIZED_PATH) ? process.env.UNAUTHORIZED_PATH : '/unauthorized.html';
const MD5_TOKEN = (typeof process !== 'undefined' && process.env && process.env.DISABLE_DEVTOOL_MD5) ? process.env.DISABLE_DEVTOOL_MD5 : '';

/* Force-block script must exist before the library calls the hook. It defines window.__mw_block(). */
const FORCE_BLOCK_SCRIPT = `
<script>
(function(){
  var style = document.createElement('style');
  style.id = 'mw-no-select-style';
  style.textContent = '*{user-select:none !important;-webkit-user-select:none !important;-moz-user-select:none !important;-ms-user-select:none !important;}';
  try { document.head && document.head.appendChild(style); } catch(e){}

  function blockEvent(e){ try{ e.preventDefault(); e.stopPropagation(); } catch(e){} }

  document.addEventListener('contextmenu', blockEvent, true);
  document.addEventListener('selectstart', blockEvent, true);
  document.addEventListener('copy', blockEvent, true);
  document.addEventListener('cut', blockEvent, true);
  document.addEventListener('paste', blockEvent, true);

  document.addEventListener('keydown', function(e){
    var k = (e.key || '').toString();
    var keyCode = e.keyCode || 0;
    var ctrl = e.ctrlKey || false;
    var meta = e.metaKey || false;
    var shift = e.shiftKey || false;
    var alt = e.altKey || false;
    var K = k.length === 1 ? k.toUpperCase() : k;

    if (K === 'F12' || keyCode === 123) { blockEvent(e); return; }
    if ((ctrl || meta) && shift && (K === 'I' || K === 'J' || K === 'C')) { blockEvent(e); return; }
    if ((ctrl || meta) && (K === 'U')) { blockEvent(e); return; }
    if ((ctrl || meta) && (K === 'C')) { blockEvent(e); return; }
    if (meta && alt && (K === 'J' || K === 'I')) { blockEvent(e); return; }
    if (ctrl && shift && K === 'J') { blockEvent(e); return; }
    if (ctrl && shift && K === 'C') { blockEvent(e); return; }
  }, true);

  var reapInterval = setInterval(function(){
    try {
      if (!document.head.querySelector('#mw-no-select-style')) {
        document.head.appendChild(style);
      }
      document.removeEventListener('contextmenu', blockEvent, true);
      document.addEventListener('contextmenu', blockEvent, true);
      document.removeEventListener('copy', blockEvent, true);
      document.addEventListener('copy', blockEvent, true);
    } catch(e){}
  }, 800);

  // immediate wipe function the library will call
  window.__mw_block = function(){
    try{
      document.documentElement.innerHTML = '<div style="height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,Arial,sans-serif"><div><h2>Access denied</h2><p>Developer tools detected.</p></div></div>';
      // attempt close (may fail in modern browsers)
      try { window.open('', '_self').close(); } catch(e){}
    }catch(e){}
  };
})();
</script>
`;

/* Init script calls the library and uses window.__mw_block for instant wipe */
const INIT_SCRIPT = (md5Token, unauthorizedPath) => `
<script>
(function(){
  var cfg = {
    disableMenu: true,
    disableCopy: true,
    disableCut: true,
    disablePaste: true,
    md5: ${JSON.stringify(md5Token||'')},
    url: ${JSON.stringify(unauthorizedPath)},
    ondevtoolopen: function(type, next){
      try { if (typeof window.__mw_block === 'function') { window.__mw_block(); } else { location.href = ${JSON.stringify(unauthorizedPath)}; } } catch(e) {}
    }
  };
  function tryInit(retries){
    if(window.DisableDevtool){ try{ window.DisableDevtool(cfg); }catch(e){} return; }
    if(!retries) return;
    setTimeout(function(){ tryInit(retries-1); }, 200);
  }
  tryInit(15);
})();
</script>
`;

/* Build final snippet: force block first, then library, then init */
function buildSnippet(md5Token, unauthorizedPath){
  return FORCE_BLOCK_SCRIPT + `\n<script src="${CDN}" disable-devtool disable-devtool-auto></script>\n` + INIT_SCRIPT(md5Token, unauthorizedPath);
}

function injectIntoHtml(body, snippet){
  if(!body||typeof body!=='string') return body;
  if(body.includes('</body>')) return body.replace('</body>', snippet + '</body>');
  if(body.includes('</head>')) return body.replace('</head>', snippet + '</head>');
  return body + snippet;
}

export async function middleware(request){
  const { pathname } = request.nextUrl;

  // prevent recursion
  if (request.headers.get(INTERNAL_HEADER) === '1') return NextResponse.next();

  const publicPages = ['/login.html','/set-password.html', UNAUTHORIZED_PATH];
  if (publicPages.includes(pathname)) return NextResponse.next();

  // session validation
  const raw = request.cookies.get('sessionid')?.value;
  if (!raw) return NextResponse.redirect(new URL('/login.html', request.url));

  let cookieValue = raw;
  try { cookieValue = decodeURIComponent(raw); } catch {}
  if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) cookieValue = cookieValue.slice(1,-1);

  const parsed = safeJsonParse(cookieValue);
  let isValid = false;
  if (parsed && parsed.accessToken) {
    isValid = !(typeof parsed.accessToken === 'string' && jwtIsExpired(parsed.accessToken));
  } else if (typeof cookieValue === 'string' && cookieValue.split('.').length === 3) {
    isValid = !jwtIsExpired(cookieValue);
  } else if (typeof cookieValue === 'string' && cookieValue.length >= 10) {
    isValid = true;
  }

  if (!isValid) return NextResponse.redirect(new URL('/login.html', request.url));

  const accept = request.headers.get('accept') || '';
  if (!accept.includes('text/html')) return NextResponse.next();

  try {
    const hdrs = new Headers(request.headers);
    hdrs.set(INTERNAL_HEADER, '1');

    const internalReq = new Request(request.url, {
      method: request.method,
      headers: hdrs,
      body: request.body,
      redirect: 'manual'
    });

    const upstream = await fetch(internalReq);
    const ct = upstream.headers.get('content-type') || '';
    if (!ct.toLowerCase().includes('text/html')) return upstream;

    let html = await upstream.text();

    const snippet = buildSnippet(MD5_TOKEN, UNAUTHORIZED_PATH);
    const newHtml = injectIntoHtml(html, snippet);

    const outHeaders = new Headers(upstream.headers);
    outHeaders.delete('content-length');
    outHeaders.delete('content-encoding');

    return new Response(newHtml, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders
    });
  } catch (e) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next|_static|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|js|map|woff2|woff|ttf)|login.html|set-password.html).*)'
  ]
};