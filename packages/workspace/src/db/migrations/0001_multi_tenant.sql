-- Workspaces RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_workspaces_policy ON workspaces
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Knowledge Sources RLS
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_knowledge_sources_policy ON knowledge_sources
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Business Entities RLS
ALTER TABLE business_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_business_entities_policy ON business_entities
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));

-- Observations RLS
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_observations_policy ON observations
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));
