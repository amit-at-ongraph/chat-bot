export const format = (value: string): string =>
  value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

type FormattableObject = Record<string, unknown>;

// overload signatures
export function toTitleCaseFromSnakeCase(input: string): string;
export function toTitleCaseFromSnakeCase(input: string[]): string[];
export function toTitleCaseFromSnakeCase(input: FormattableObject): string[];

// implementation
export function toTitleCaseFromSnakeCase(
  input: string | string[] | FormattableObject,
): string | string[] {
  if (typeof input === "string") {
    return format(input);
  }

  if (Array.isArray(input)) {
    return input.map(format);
  }

  return Object.values(input).map(format);
}

export function createOptionsFromEnum(
  enumObject: Record<string, string>,
): { label: string; value: string }[] {
  return Object.values(enumObject).map((value) => ({
    label: toTitleCaseFromSnakeCase(value),
    value,
  }));
}
