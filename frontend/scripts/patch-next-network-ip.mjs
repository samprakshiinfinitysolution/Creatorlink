import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function patchFile(relPath, target, replacement) {
  try {
    const fullPath = path.join(__dirname, "..", relPath);
    if (!fs.existsSync(fullPath)) return;
    const content = fs.readFileSync(fullPath, "utf8");
    if (content.includes(target)) {
      fs.writeFileSync(fullPath, content.replace(target, replacement), "utf8");
    }
  } catch {
    // Non-blocking fallback
  }
}

// Patch Next.js start-server to display actual local network IPv4 address instead of 0.0.0.0
patchFile(
  "node_modules/next/dist/server/lib/start-server.js",
  "const networkHostname = hostname ?? (0, _getnetworkhost.getNetworkHost)((0, _isipv6.isIPv6)(actualHostname) ? 'IPv6' : 'IPv4');",
  "const networkHostname = (!hostname || hostname === '0.0.0.0' || hostname === '::') ? ((0, _getnetworkhost.getNetworkHost)((0, _isipv6.isIPv6)(actualHostname) ? 'IPv6' : 'IPv4') || hostname) : hostname;"
);

patchFile(
  "node_modules/next/dist/esm/server/lib/start-server.js",
  "const networkHostname = hostname ?? getNetworkHost(isIPv6(actualHostname) ? 'IPv6' : 'IPv4');",
  "const networkHostname = (!hostname || hostname === '0.0.0.0' || hostname === '::') ? (getNetworkHost(isIPv6(actualHostname) ? 'IPv6' : 'IPv4') || hostname) : hostname;"
);

