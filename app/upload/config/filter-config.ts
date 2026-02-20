import { ApplicableRole, Jurisdiction, LifecycleState, Scenario } from "@/lib/constants";
import { createOptionsFromEnum } from "../../utils/string.utils";

export type FilterKey = "scenario" | "jurisdiction" | "lifecycleState" | "applicableRoles";

export const filterConfigs: {
  key: FilterKey;
  options: { label: string; value: string }[];
  label: string;
  placeholder: string;
}[] = [
  {
    key: "scenario",
    options: createOptionsFromEnum(Scenario),
    label: "upload.all_scenarios",
    placeholder: "upload.scenarios_placeholder",
  },
  {
    key: "jurisdiction",
    options: createOptionsFromEnum(Jurisdiction),
    label: "upload.all_jurisdictions",
    placeholder: "upload.jurisdictions_placeholder",
  },
  {
    key: "lifecycleState",
    options: createOptionsFromEnum(LifecycleState),
    label: "upload.all_status",
    placeholder: "upload.status_placeholder",
  },
  {
    key: "applicableRoles",
    options: createOptionsFromEnum(ApplicableRole),
    label: "upload.all_roles",
    placeholder: "upload.roles_placeholder",
  },
];
