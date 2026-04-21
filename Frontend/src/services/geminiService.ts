export const generateAlertSummary = async (alertData: { llm_summary?: string | null }): Promise<string> => {
  return alertData.llm_summary || 'Use the backend enrichment endpoint to generate summaries.';
};
