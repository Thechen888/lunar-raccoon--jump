// 批量修改复杂度 - 改为通过名称匹配，这样能同时修改所有区域中同名的复杂度
  const handleBatchEditComplexities = (updates: Array<{ id: string; name: string; description?: string }>) => {
    if (!editingProviderForBatchEdit) return;

    const newProviders = providers.map(provider => {
      if (provider.id !== editingProviderForBatchEdit.id) return provider;

      return {
        ...provider,
        regions: provider.regions.map(region => ({
          ...region,
          complexities: region.complexities.map(complexity => {
            // 通过名称找到对应的更新
            const update = updates.find(u => u.id === complexity.id);
            if (update) {
              return {
                ...complexity,
                name: update.name,
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