export default async function to<T>(
  promise: Promise<T>,
): Promise<[Error | null, T | undefined]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    return [
      error instanceof Error ? error : new Error(String(error)),
      undefined,
    ];
  }
}
