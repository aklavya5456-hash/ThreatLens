import { isIP } from "node:net";
import { MAX_DOMAIN_LENGTH } from "./contracts.ts";
import { ScanApiError } from "./errors.ts";
import { isValidDomain, normalizeDomain } from "./validation.ts";

export type DnsResolver = (domain: string) => Promise<ReadonlyArray<string>>;

function isPrivateOrReservedIpv4(octets: ReadonlyArray<number>): boolean {
  const [first, second, third] = octets;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 88 && third === 99) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
}

function parseIpv6Words(address: string): ReadonlyArray<number> | null {
  let clean = address.toLowerCase().split("%")[0].trim();
  const lastColon = clean.lastIndexOf(":");
  if (lastColon !== -1) {
    const after = clean.slice(lastColon + 1);
    if (after.includes(".")) {
      const v4Octets = after.split(".").map(Number);
      if (v4Octets.length === 4 && v4Octets.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
        const hex1 = (((v4Octets[0] << 8) | v4Octets[1]) >>> 0).toString(16);
        const hex2 = (((v4Octets[2] << 8) | v4Octets[3]) >>> 0).toString(16);
        clean = clean.slice(0, lastColon) + ":" + hex1 + ":" + hex2;
      }
    }
  }

  const parts = clean.split("::");
  if (parts.length > 2) {
    return null;
  }

  let hexStrings: ReadonlyArray<string>;
  if (parts.length === 2) {
    const left = parts[0] ? parts[0].split(":") : [];
    const right = parts[1] ? parts[1].split(":") : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) {
      return null;
    }
    hexStrings = [...left, ...Array(missing).fill("0"), ...right];
  } else {
    hexStrings = clean.split(":");
    if (hexStrings.length !== 8) {
      return null;
    }
  }

  const words = hexStrings.map((h) => parseInt(h, 16));
  if (words.some((w) => !Number.isInteger(w) || w < 0 || w > 0xffff)) {
    return null;
  }
  return words;
}

export function isPrivateOrReservedIp(address: string): boolean {
  if (isIP(address) === 4) {
    const octets = address.split(".").map(Number);
    if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
      return true;
    }
    return isPrivateOrReservedIpv4(octets);
  }

  if (isIP(address) === 6) {
    const words = parseIpv6Words(address);
    if (!words) {
      return true;
    }

    // Unspecified ::/128
    if (words.every((w) => w === 0)) {
      return true;
    }

    // Loopback ::1/128
    if (words.slice(0, 7).every((w) => w === 0) && words[7] === 1) {
      return true;
    }

    // IPv4-mapped IPv6 (::ffff:0:0/96)
    if (words.slice(0, 5).every((w) => w === 0) && words[5] === 0xffff) {
      const v4 = [(words[6] >> 8) & 0xff, words[6] & 0xff, (words[7] >> 8) & 0xff, words[7] & 0xff];
      return isPrivateOrReservedIpv4(v4);
    }

    // IPv4-compatible IPv6 (::0:0/96, deprecated)
    if (words.slice(0, 6).every((w) => w === 0)) {
      const v4 = [(words[6] >> 8) & 0xff, words[6] & 0xff, (words[7] >> 8) & 0xff, words[7] & 0xff];
      return isPrivateOrReservedIpv4(v4);
    }

    // IPv6 Multicast (ff00::/8)
    if ((words[0] & 0xff00) === 0xff00) {
      return true;
    }

    // Unique Local (fc00::/7)
    if ((words[0] & 0xfe00) === 0xfc00) {
      return true;
    }

    // Link-Local (fe80::/10)
    if ((words[0] & 0xffc0) === 0xfe80) {
      return true;
    }

    // Discard prefix (100::/64)
    if (words[0] === 0x0100 && words[1] === 0 && words[2] === 0 && words[3] === 0) {
      return true;
    }

    // Documentation (2001:db8::/32)
    if (words[0] === 0x2001 && words[1] === 0x0db8) {
      return true;
    }

    // 6to4 prefix (2002::/16) - validate embedded IPv4
    if (words[0] === 0x2002) {
      const v4 = [(words[1] >> 8) & 0xff, words[1] & 0xff, (words[2] >> 8) & 0xff, words[2] & 0xff];
      if (isPrivateOrReservedIpv4(v4)) {
        return true;
      }
    }

    return false;
  }

  return true;
}

export async function assertSafeTarget(domainInput: string, resolve: DnsResolver): Promise<string> {
  const domain = normalizeDomain(domainInput);
  if (domain.length > MAX_DOMAIN_LENGTH || !isValidDomain(domain)) {
    throw new ScanApiError("INVALID_DOMAIN", "The scan request is invalid.", 400);
  }

  const addresses = await resolve(domain);
  if (addresses.length === 0 || addresses.some(isPrivateOrReservedIp)) {
    throw new ScanApiError("UNSAFE_TARGET", "The requested target is not eligible for assessment.", 400);
  }

  return domain;
}
