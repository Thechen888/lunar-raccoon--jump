<Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <File className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{doc.name}</span>
                            <Badge variant={doc.status === "processed" ? "default" : "secondary"} className="text-xs">
                              {doc.status === "processed" ? "已处理" : "处理中"}
                            </Badge>
                            {getConversionStatusBadge(doc.conversionStatus)}
                          </div>