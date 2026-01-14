const [complexityDeleteDialogOpen, setComplexityDeleteDialogOpen] = useState(false);
  const [deletingProviderId, setDeletingProviderId] = useState<string | null>(null);
  const [selectedComplexityToDelete, setSelectedComplexityToDelete] = useState<string | null>(null);

  // 统一删除选定的复杂度（所有区域）
  const handleDeleteAllComplexities = () => {
    if (!deletingProviderId || !selectedComplexityToDelete) return;
    const newProviders = providers.map(provider => {
      if (provider.id !== deletingProviderId) return provider;
      return {
        ...provider,
        regions: provider.regions.map(region => ({
          ...region,
          complexities: region.complexities.filter(c => c.id !== selectedComplexityToDelete)
        }))
      };
    });
    onProvidersChange(newProviders);
    setComplexityDeleteDialogOpen(false);
    setDeletingProviderId(null);
    setSelectedComplexityToDelete(null);
    toast.success(`复杂度级别 "${selectedComplexityToDelete}" 已删除`);
  };

  // 统一删除复杂度对话框
  const handleOpenComplexityDelete = (providerId: string) => {
    setDeletingProviderId(providerId);
    setSelectedComplexityToDelete(null);
    setComplexityDeleteDialogOpen(true);
  };

  // 统一删除复杂度对话框
  <Dialog open={complexityDeleteDialogOpen} onOpenChange={setComplexityDeleteDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>统一删除复杂度</DialogTitle>
        <DialogDescription>
          选择要删除的复杂度级别，该级别将从所有区域中删除。
        </DialogDescription>
      </DialogHeader>
      {deletingProviderId && (
        <div className="space-y-3">
          <Label>选择复杂度级别</Label>
          <div className="space-y-2">
            {providers.find(p => p.id === deletingProviderId)?.regions[0]?.complexities.map((complexity) => (
              <div
                key={complexity.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedComplexityToDelete === complexity.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedComplexityToDelete(complexity.id)}
              >
                <div className="flex items-center space-x-2">
                  {selectedComplexityToDelete === complexity.id && <Check className="h-4 w-4 text-primary" />}
                  <span className="font-medium">{complexity.name}</span>
                  {complexity.description && (
                    <span className="text-sm text-muted-foreground">- {complexity.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => {
          setComplexityDeleteDialogOpen(false);
          setDeletingProviderId(null);
          setSelectedComplexityToDelete(null);
        }}>
          取消
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleDeleteAllComplexities}
          disabled={!selectedComplexityToDelete}
        >
          确认删除
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  // 统一删除复杂度按钮
  {provider.layer === 3 && hasComplexities && (
    <Button
      variant="outline"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        handleOpenComplexityDelete(provider.id);
      }}
      title="选择复杂度级别进行统一删除"
      className="text-destructive border-destructive hover:bg-destructive/10"
    >
      <Trash2 className="h-4 w-4" />
      <span className="ml-1">删除复杂度</span>
    </Button>
  )}