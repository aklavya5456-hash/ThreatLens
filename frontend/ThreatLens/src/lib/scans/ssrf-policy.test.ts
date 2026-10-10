import assert from "node:assert/strict";
import test from "node:test";
import { assertSafeTarget, isPrivateOrReservedIp } from "./ssrf-policy.ts";

test("rejects private, loopback, link-local, and reserved mocked DNS results", async () => {
  for (const address of ["127.0.0.1", "10.0.0.4", "172.16.0.4", "192.168.1.2", "169.254.169.254", "::1", "fd00::1", "fe80::1"]) {
    assert.equal(isPrivateOrReservedIp(address), true, address);
    await assert.rejects(() => assertSafeTarget("example.com", async () => [address]), { code: "UNSAFE_TARGET" });
  }
});

test("rejects IPv4-mapped IPv6 addresses mapping to private or reserved IPv4 addresses", async () => {
  const mappedAddresses = [
    "::ffff:169.254.169.254",
    "::ffff:172.16.0.1",
    "::ffff:127.0.0.1",
    "::ffff:10.0.0.1",
    "::ffff:192.168.1.1",
    "::ffff:100.64.0.1",
    "::ffff:198.18.0.1",
    "::ffff:224.0.0.1",
    "::ffff:a9fe:a9fe",
    "::ffff:7f00:1",
    "::ffff:ac10:1",
  ];

  for (const address of mappedAddresses) {
    assert.equal(isPrivateOrReservedIp(address), true, address);
    await assert.rejects(() => assertSafeTarget("example.com", async () => [address]), { code: "UNSAFE_TARGET" });
  }
});

test("rejects IPv6 multicast and special reserved addresses", async () => {
  const ipv6Special = [
    "::",
    "ff02::1",
    "ff05::2",
    "ff0e::1",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "febf::1",
    "100::1",
    "2001:db8::1",
    "2002:7f00:1::",
    "2002:a9fe:a9fe::",
  ];

  for (const address of ipv6Special) {
    assert.equal(isPrivateOrReservedIp(address), true, address);
    await assert.rejects(() => assertSafeTarget("example.com", async () => [address]), { code: "UNSAFE_TARGET" });
  }
});

test("accepts a public mocked DNS result without making a network call", async () => {
  assert.equal(await assertSafeTarget("Example.com", async () => ["93.184.216.34"]), "example.com");
  assert.equal(await assertSafeTarget("Example.com", async () => ["2606:4700:4700::1111"]), "example.com");
  assert.equal(await assertSafeTarget("Example.com", async () => ["::ffff:93.184.216.34"]), "example.com");
});
