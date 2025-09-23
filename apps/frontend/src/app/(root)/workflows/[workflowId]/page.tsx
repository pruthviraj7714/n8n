import WorkflowPageComponent from "@/components/WorkflowPageComponent";

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const workflowId = (await params).workflowId;

  return <WorkflowPageComponent workflowId={workflowId} />;
}
