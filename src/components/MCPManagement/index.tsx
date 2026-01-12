const handleEditService = (service: MCPService) => {
    // 解析serviceId获取providerId, regionId, complexityId
    const parts = service.id.split('-');
    const providerId = parts[0];
    const regionId = parts[1];
    const complexityId = parts[2];
    
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;
    
    let serviceConfig: MCPServiceConfig | undefined;
    
    if (provider.layer === 1) {
      serviceConfig = provider.service;
    } else if (provider.layer === 2 && regionId) {
      const region = provider.regions.find(r => r.id === regionId);
      serviceConfig = region?.service;
    } else if (provider.layer === 3 && regionId && complexityId) {
      const region = provider.regions.find(r => r.id === regionId);
      const complexity = region?.complexities.find(c => c.id === complexityId);
      serviceConfig = complexity?.service;
    }
    
    // 如果没有配置，使用服务当前信息作为默认配置
    const configToEdit: MCPServiceConfig = serviceConfig || {
      name: service.name,
      description: service.description,
      url: service.url,
      headers: service.headers
    };
    
    setEditingService({
      providerId,
      regionId,
      complexityId,
      service
    });
    setEditConfigDialogOpen(true);
  };