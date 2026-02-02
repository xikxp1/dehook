const ITERATIONS = 100000;
const KEY_LENGTH = 256;

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt,
      iterations: ITERATIONS,
    },
    keyMaterial,
    KEY_LENGTH,
  );

  const keyArray = Array.from(new Uint8Array(keyBuffer));
  const saltArray = Array.from(salt);
  const iterHex = ITERATIONS.toString(16).padStart(6, "0");
  const iterMatches = iterHex.match(/.{2}/g) ?? [];
  const iterArray = iterMatches.map((byte) => Number.parseInt(byte, 16));

  const composite = [...saltArray, ...iterArray, ...keyArray];
  const compositeStr = composite.map((b) => String.fromCharCode(b)).join("");

  return btoa(`v01${compositeStr}`);
}

export async function verifyPassword(
  storedHash: string,
  password: string,
): Promise<boolean> {
  try {
    const compositeStr = atob(storedHash);
    const version = compositeStr.slice(0, 3);

    if (version !== "v01") {
      throw new Error("Invalid hash version");
    }

    const saltStr = compositeStr.slice(3, 19);
    const iterStr = compositeStr.slice(19, 22);
    const storedKeyStr = compositeStr.slice(22, 54);

    const salt = new Uint8Array(
      saltStr.split("").map((ch) => ch.charCodeAt(0)),
    );
    const iterHex = iterStr
      .split("")
      .map((ch) => ch.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
    const iterations = Number.parseInt(iterHex, 16);

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );

    const keyBuffer = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations },
      keyMaterial,
      KEY_LENGTH,
    );

    const derivedKeyStr = Array.from(new Uint8Array(keyBuffer))
      .map((b) => String.fromCharCode(b))
      .join("");

    return derivedKeyStr === storedKeyStr;
  } catch {
    return false;
  }
}
