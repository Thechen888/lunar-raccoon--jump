# Tech Stack

- You are building a React application.
- Use TypeScript.
- Use React Router. KEEP the routes in src/App.tsx
- Always put source code in the src folder.
- Put pages into src/pages/
- Put components into src/components/
- The main page (default page) is src/pages/Index.tsx
- UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
- ALWAYS try to use the shadcn/ui library.
- Tailwind CSS: always use Tailwind CSS for styling components. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.

Available packages and libraries:

- The lucide-react package is installed for icons.
- You ALREADY have ALL the shadcn/ui components and their dependencies installed. So you don't need to install them again.
- You have ALL the necessary Radix UI components installed.
- Use prebuilt components from the shadcn/ui library after importing them. Note that these files shouldn't be edited, so make new components if you need to change them.

## Code Organization Rules

- **细分组件原则**：所有业务组件都应该细分到独立的子目录中
- **目录结构**：使用 `src/components/组件名/子组件名.tsx` 的结构
- **示例**：
  - `src/components/MCPSelector/MCPTypeList.tsx` - MCP类型列表
  - `src/components/MCPSelector/MCPConfigItem.tsx` - MCP配置项
  - `src/components/DocumentSelector/DocumentCard.tsx` - 文档卡片
  - `src/components/UserPermissions/UserList.tsx` - 用户列表
  - `src/components/UserPermissions/RoleCard.tsx` - 角色卡片
- **避免重写整个文件**：修改时只更新需要的子组件文件，而不是整个父组件
- **保持组件简洁**：每个子组件文件应该保持在 100 行代码以内
- **主入口文件**：在 `src/components/组件名/index.tsx` 中导出主组件，聚合所有子组件