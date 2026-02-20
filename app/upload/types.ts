import { ApplicableRole, Jurisdiction, LifecycleState, Scenario } from "@/lib/constants";

export interface MetadataState {
  topic: string;
  jurisdiction: Jurisdiction;
  scenario: Scenario;
  applicableRoles: ApplicableRole[];
  lifecycleState: LifecycleState;
  lastReviewed: string;
  lexicalTriggers: string;
}

export const INITIAL_METADATA: MetadataState = {
  topic: "",
  jurisdiction: Jurisdiction.GLOBAL,
  scenario: Scenario.GLOBAL,
  applicableRoles: [],
  lifecycleState: LifecycleState.ACTIVE,
  lastReviewed: "",
  lexicalTriggers: "",
};
