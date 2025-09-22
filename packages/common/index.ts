import { z } from "zod";

export const PlatformSchema = z.enum(["TELEGRAM", "RESEND"], {
  error: "Invalid platform",
});

export const HttpMethodSchema = z.enum(["GET", "POST"], {
  error: "Invalid HTTP method",
});

export const NodeTypeSchema = z.enum(["TRIGGER", "ACTION"], {
  error: "Invalid node type",
});

export const TriggerTypeSchema = z.enum(["MANUAL", "WEBHOOK", "CRON"], {
  error: "Invalid trigger type",
});

export const WorkflowExecutionStatusSchema = z.enum(
  ["RUNNING", "SUCCESS", "FAILED", "CANCELLED"],
  {
    error: "Invalid workflow execution status",
  }
);

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Invalid ObjectId format",
});

export const UserSchema = z.object({
  id: ObjectIdSchema,
  email: z.string().email("Invalid email format"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const CreateUserSchema = UserSchema.omit({ id: true });

export const UpdateUserSchema = UserSchema.partial().omit({ id: true });

export const WebhookSchema = z.object({
  id: ObjectIdSchema,
  path: z.string().min(1, "Path is required"),
  method: HttpMethodSchema,
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  nodeId: ObjectIdSchema,
  workflowId: ObjectIdSchema,
});

export const CreateWebhookSchema = WebhookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  active: z.boolean().optional().default(true),
});

export const UpdateWebhookSchema = WebhookSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const NodeSchema = z.object({
  type: NodeTypeSchema,
  triggerType: TriggerTypeSchema.optional(),
  position: z.record(z.string(), z.number()),
  actionPlatform: PlatformSchema.optional(),
  action: z.record(z.string(), z.any()).optional(),
  data: z.record(z.string(), z.any()).optional(),
});



export const NodeWithWebhookSchema = NodeSchema.extend({
  webhook: WebhookSchema.optional(),
});

export const WorkflowSchema = z.object({
  title: z.string().min(1, "Title is required"),
  enabled: z.boolean(),
  connections: z.array(z.any()),
  nodes: z.array(NodeSchema),
  worflowExecutions: z.array(z.any()), 
});

export const CreateWorkflowSchema = WorkflowSchema.omit({
  worflowExecutions: true,
});

export const UpdateWorkflowSchema = WorkflowSchema.partial().omit({
  id: true,
  worflowExecutions: true,
});

export const WorkflowWithNodesSchema = WorkflowSchema.extend({
  nodes: z.array(NodeWithWebhookSchema),
  webhook: WebhookSchema.optional(),
});

export const WorkflowExecutionsSchema = z.object({
  id: ObjectIdSchema,
  status: WorkflowExecutionStatusSchema,
  startedAt: z.date(),
  finishedAt: z.date().optional(),
  workflowId: ObjectIdSchema,
});

export const CreateWorkflowExecutionsSchema = WorkflowExecutionsSchema.omit({
  id: true,
  startedAt: true,
}).extend({
  startedAt: z.date().optional(),
});

export const UpdateWorkflowExecutionsSchema =
  WorkflowExecutionsSchema.partial().omit({
    id: true,
    startedAt: true,
  });

export const CredentialsSchema = z.object({
  id: ObjectIdSchema,
  title: z.string().min(1, "Title is required"),
  platform: PlatformSchema,
  data: z.record(z.string(), z.any()),
  userId: ObjectIdSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateCredentialsSchema = CredentialsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateCredentialsSchema = CredentialsSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const AvailableCredentialsApplicationsSchema = z.object({
  id: ObjectIdSchema,
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  platform: PlatformSchema,
});

export const CreateAvailableCredentialsApplicationsSchema =
  AvailableCredentialsApplicationsSchema.omit({
    id: true,
  });

export const UpdateAvailableCredentialsApplicationsSchema =
  AvailableCredentialsApplicationsSchema.partial().omit({
    id: true,
  });

export const UserWithRelationsSchema = UserSchema.extend({
  workflows: z.array(WorkflowSchema).optional(),
  credentials: z.array(CredentialsSchema).optional(),
});

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const UserQuerySchema = PaginationSchema.extend({
  email: z.string().optional(),
  username: z.string().optional(),
});

export const WorkflowQuerySchema = PaginationSchema.extend({
  title: z.string().optional(),
  enabled: z.coerce.boolean().optional(),
  userId: ObjectIdSchema.optional(),
});

export const NodeQuerySchema = PaginationSchema.extend({
  type: NodeTypeSchema.optional(),
  triggerType: TriggerTypeSchema.optional(),
  actionPlatform: PlatformSchema.optional(),
  workflowId: ObjectIdSchema.optional(),
});

export const CredentialsQuerySchema = PaginationSchema.extend({
  title: z.string().optional(),
  platform: PlatformSchema.optional(),
  userId: ObjectIdSchema.optional(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export const PaginatedResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    items: z.array(z.any()),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export type Workflow = z.infer<typeof WorkflowSchema>;
export type CreateWorkflow = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflow = z.infer<typeof UpdateWorkflowSchema>;

export type Node = z.infer<typeof NodeSchema>;

export type Webhook = z.infer<typeof WebhookSchema>;
export type CreateWebhook = z.infer<typeof CreateWebhookSchema>;
export type UpdateWebhook = z.infer<typeof UpdateWebhookSchema>;

export type WorkflowExecutions = z.infer<typeof WorkflowExecutionsSchema>;
export type CreateWorkflowExecutions = z.infer<
  typeof CreateWorkflowExecutionsSchema
>;
export type UpdateWorkflowExecutions = z.infer<
  typeof UpdateWorkflowExecutionsSchema
>;

export type Credentials = z.infer<typeof CredentialsSchema>;
export type CreateCredentials = z.infer<typeof CreateCredentialsSchema>;
export type UpdateCredentials = z.infer<typeof UpdateCredentialsSchema>;

export type AvailableCredentialsApplications = z.infer<
  typeof AvailableCredentialsApplicationsSchema
>;
export type CreateAvailableCredentialsApplications = z.infer<
  typeof CreateAvailableCredentialsApplicationsSchema
>;
export type UpdateAvailableCredentialsApplications = z.infer<
  typeof UpdateAvailableCredentialsApplicationsSchema
>;

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type PaginationQuery = z.infer<typeof PaginationSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;
