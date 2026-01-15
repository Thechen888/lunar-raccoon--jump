<div className="flex items-center space-x-2">
                  {/* 三层结构：批量修改复杂度按钮 */}
                  {provider.layer === 3 && hasComplexities && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBatchEditDialog(provider);
                      }}
                      title="批量修改复杂度"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                  {/* 三层结构：统一删除复杂度按钮 */}
                  {provider.layer === 3 && hasComplexities && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSelectComplexityDialog(provider.id);
                      }}
                      title="统一删除复杂度"
                    >
                      <Eraser className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    setEditingProvider(provider);
                    setProviderMode("edit");
                    setProviderDialogOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({
                      type: "provider",
                      providerId: provider.id,
                      name: provider.name
                    });
                    setDeleteDialogOpen(true);
                  }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  {/* 只有一层结构才在最外层显示配置按钮 */}
                  {provider.layer === 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenConfig(provider.id, "provider");
                      }}
                      title="配置服务"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>