{/* 三层结构：在所有区域后添加一个添加复杂度级别的按钮 */}
                {provider.layer === 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      if (provider.regions.length === 0) {
                        toast.error("请先添加区域");
                        return;
                      }
                      setEditingComplexity({
                        providerId: provider.id,
                        regionId: provider.regions[0]?.id || "",
                        complexity: { id: "", name: "", description: "" }
                      });
                      setComplexityMode("create");
                      setComplexityDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加复杂度级别（将添加到所有区域）
                  </Button>
                )}