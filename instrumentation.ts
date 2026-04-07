export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { migrate } = await import("./app/migrate");
    await migrate();
  }
}
