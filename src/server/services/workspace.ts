import "server-only";

import { requireUser } from "../session";
import { simulate } from "../simulate";

/**
 * Deployments, registries and models are designed stubs: the placeholder
 * backend has none yet, so each returns an honest empty list (after the
 * persona's latency/failure behaviour, so their states stay reachable).
 */
export type DeploymentDTO = { id: string; name: string };
export type RegistryDTO = { id: string; name: string };
export type ModelDTO = { id: string; name: string };

export async function listDeployments(): Promise<DeploymentDTO[]> {
  const user = await requireUser();
  await simulate(user, "DEPLOYMENTS_UNAVAILABLE");
  return [];
}

export async function listRegistries(): Promise<RegistryDTO[]> {
  const user = await requireUser();
  await simulate(user, "REGISTRIES_UNAVAILABLE");
  return [];
}

export async function listModels(): Promise<ModelDTO[]> {
  const user = await requireUser();
  await simulate(user, "MODELS_UNAVAILABLE");
  return [];
}
