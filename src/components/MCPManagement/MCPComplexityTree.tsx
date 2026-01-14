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
                      <Layers className="h-4 w-4 text-destructive" />
                    </Button>
                  )}