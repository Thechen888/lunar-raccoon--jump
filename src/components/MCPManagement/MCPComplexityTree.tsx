// 批量修改复杂度 - 通过原始名称匹配所有区域中同名的复杂度
  const handleBatchEditComplexities = (updates: Array<{ originalName: string; newName: string; description?: string }>) => {
    if (!editingProviderForBatchEdit) return;

    const newProviders = providers.map(provider => {
      if (provider.id !== editingProviderForBatchEdit.id) return provider;

      return {
        ...provider,
        regions: provider.regions.map(region => ({
          ...region,
          complexities: region.complexities.map(complexity => {
            // 通过原始名称找到对应的更新
            const update = updates.find(u => u.originalName === complexity.name);
            if (update) {
              return {
                ...complexity,
                name: update.newName,
                description: update.description
              };
            }
            return complexity;
          })
        }))
      };
    });

    onProvidersChange(newProviders);
    toast.success("已批量修改复杂度级别");
  };