<Select value={qaStatusFilter} onValueChange={(v: any) => setQaStatusFilter(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">启用</SelectItem>
                </SelectContent>
              </Select>