import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "LEADER",
  "EMPLOYEE",
]);

export const userStatusEnum = pgEnum("user_status", [
  "INVITED",
  "ACTIVE",
  "INACTIVE",
]);

export const employeeStatusEnum = pgEnum("employee_status", [
  "ACTIVE",
  "INACTIVE",
]);

export const skillCategoryEnum = pgEnum("skill_category", [
  "TECHNICAL",
  "BEHAVIORAL",
  "CULTURE",
]);

export const cycleStatusEnum = pgEnum("cycle_status", [
  "DRAFT",
  "SELF_EVALUATION",
  "LEADER_EVALUATION",
  "COMPARISON",
  "FEEDBACK",
  "CLOSED",
]);

export const evaluationTypeEnum = pgEnum("evaluation_type", ["SELF", "LEADER"]);

export const evaluationStatusEnum = pgEnum("evaluation_status", [
  "DRAFT",
  "SUBMITTED",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "NOT_STARTED",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
]);

export const companyStatusEnum = pgEnum("company_status", [
  "ACTIVE",
  "INACTIVE",
]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", [
  "ESSENTIAL",
  "GROWTH",
  "SCALE",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["CARD", "PIX"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "CANCELLED",
]);
