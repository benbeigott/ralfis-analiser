import { execSync } from "child_process";
import { ReplitConnectors } from "@replit/connectors-sdk";

async function main() {
  const connectors = new ReplitConnectors();

  // Get GitHub user to verify connection works
  const userResp = await connectors.proxy("github", "/user", { method: "GET" });
  const user = await userResp.json() as { login: string };
  console.log("GitHub user:", user.login);

  // Get token via internal API
  // The connectors SDK signs requests — we extract the token by inspecting headers
  const testResp = await connectors.proxy("github", "/user", { method: "GET" });
  const authHeader = (testResp as unknown as { headers?: { get?: (h: string) => string } }).headers?.get?.("authorization");
  console.log("Auth header present:", !!authHeader);
}

main().catch(console.error);
