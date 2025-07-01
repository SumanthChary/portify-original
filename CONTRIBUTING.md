
# 🤝 Contributing to Portify

Thank you for your interest in contributing to Portify! We're excited to work with developers, designers, and creators who want to make product migration easier for everyone.

## 🌟 Ways to Contribute

### 🔧 Code Contributions
- **Platform Integrations**: Add support for new e-commerce platforms
- **Feature Development**: Implement new features from our roadmap
- **Bug Fixes**: Help us squash bugs and improve reliability
- **Performance Improvements**: Optimize code for better performance
- **Testing**: Add unit tests, integration tests, and e2e tests

### 🎨 Design & UX
- **UI Improvements**: Enhance the user interface and experience
- **Accessibility**: Make the platform more accessible to all users
- **Mobile Optimization**: Improve mobile responsiveness
- **Design Systems**: Contribute to our component library

### 📚 Documentation
- **API Documentation**: Improve our API reference
- **Tutorials**: Create step-by-step guides for users
- **Video Content**: Record tutorials and demos
- **Translation**: Help us support multiple languages

### 🐛 Issue Reporting
- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new features and improvements
- **Performance Issues**: Report slow or inefficient operations
- **Security Concerns**: Responsibly report security vulnerabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Basic knowledge of React/TypeScript
- Familiarity with REST APIs (helpful)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/portify.git
   cd portify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## 📋 Contribution Process

### 1. Choose Your Contribution
- Browse [open issues](https://github.com/yourusername/portify/issues)
- Check our [roadmap](https://github.com/yourusername/portify/projects)
- Look for `good first issue` or `help wanted` labels

### 2. Discuss Before Building
- Comment on the issue you want to work on
- For major features, create a discussion first
- Get feedback on your approach before coding

### 3. Create Your Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 4. Write Quality Code
- Follow our coding standards (see below)
- Add tests for new functionality
- Update documentation as needed
- Keep commits atomic and well-described

### 5. Submit Pull Request
- Use our PR template
- Link to relevant issues
- Add screenshots for UI changes
- Request review from maintainers

## 📏 Coding Standards

### TypeScript
```typescript
// ✅ Good
interface MigrationConfig {
  sourceUrl: string;
  targetPlatform: string;
  batchSize?: number;
}

const migrationConfig: MigrationConfig = {
  sourceUrl: 'https://api.gumroad.com',
  targetPlatform: 'payhip',
  batchSize: 10
};
```

### React Components
```tsx
// ✅ Good - Functional component with proper typing
interface ProductCardProps {
  product: Product;
  onMigrate: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onMigrate 
}) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">{product.title}</h3>
      <Button onClick={() => onMigrate(product.id)}>
        Migrate
      </Button>
    </div>
  );
};
```

### Commit Messages
We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add shopify integration
fix: resolve migration timeout issue
docs: update API documentation
style: improve button styling
refactor: optimize database queries
test: add unit tests for migration service
```

## 🧪 Testing Guidelines

### Unit Tests
```typescript
// Example test
describe('MigrationService', () => {
  it('should migrate products successfully', async () => {
    const products = [mockProduct];
    const result = await migrationService.migrate(products);
    
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('success');
  });
});
```

### Integration Tests
- Test API endpoints with real data
- Test N8n workflow integrations
- Test database operations

### E2E Tests
- Test complete user workflows
- Test platform integrations
- Test error scenarios

## 🏷️ Issue Labels

- `good first issue` - Great for newcomers
- `help wanted` - Looking for contributors
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `question` - Further information needed

## 🎯 Platform Integration Guide

Adding a new platform? Here's what you need:

### 1. API Integration
```typescript
// src/services/NewPlatformService.ts
export class NewPlatformService {
  async createProduct(product: Product): Promise<PlatformProduct> {
    // Implementation
  }
  
  async uploadAsset(asset: File): Promise<string> {
    // Implementation
  }
}
```

### 2. N8n Workflow Node
```typescript
// automation/nodes/NewPlatform.node.ts
export class NewPlatform implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'New Platform',
    // ... configuration
  };
}
```

### 3. Documentation
- Add platform setup guide
- Document API requirements
- Include example workflows

## 🏆 Recognition

Contributors get recognition through:
- 📝 **Changelog mentions** for each release
- 🎖️ **Contributor badges** on GitHub profile
- 🌟 **Hall of Fame** on our website
- 📧 **Early access** to new features
- 🎁 **Exclusive swag** for significant contributions

## 💬 Community Guidelines

### Be Respectful
- Use inclusive language
- Respect different perspectives
- Provide constructive feedback
- Help newcomers feel welcome

### Be Collaborative
- Share knowledge openly
- Credit others' work
- Ask questions when unsure
- Offer help to other contributors

### Be Professional
- Keep discussions on-topic
- Use appropriate channels for different topics
- Follow our code of conduct
- Maintain confidentiality of sensitive information

## 📞 Getting Help

### Development Questions
- **GitHub Discussions**: Best for feature discussions
- **Discord**: Real-time chat with the community
- **Stack Overflow**: Use the `portify` tag

### Contribution Questions
- **Email**: contributors@portify.dev
- **Discord**: #contributors channel
- **GitHub Issues**: For specific problems

## 🙏 Thank You

Every contribution, no matter how small, makes Portify better for the entire creator community. Thank you for being part of our mission to democratize e-commerce platform migration!

---

Ready to contribute? Check out our [good first issues](https://github.com/yourusername/portify/labels/good%20first%20issue) and let's build something amazing together! 🚀
