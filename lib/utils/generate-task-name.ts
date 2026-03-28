const BASE36_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";
const NAME_LENGTH = 9;
const PREFIX_LENGTH = 4;

function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function toBase36(num: number, length: number): string {
  let result = "";
  let remaining = num;
  for (let i = 0; i < length; i++) {
    result = BASE36_CHARS[remaining % 36] + result;
    remaining = Math.floor(remaining / 36);
  }
  return result;
}

export function generateTaskName(inputs: {
  type: string;
  owner: string;
  description: string;
}): string {
  const seed = `${inputs.type}:${inputs.owner}:${inputs.description}`.toLowerCase();
  const prefix = toBase36(simpleHash(seed), PREFIX_LENGTH);

  const suffix = toBase36(
    simpleHash(`${Date.now()}:${Math.random()}`),
    NAME_LENGTH - PREFIX_LENGTH
  );

  return `${prefix}${suffix}`;
}
