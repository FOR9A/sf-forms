# Deployment Guide for @your-org/dynamic-form

This guide covers how to publish and deploy the dynamic form package to multiple projects.

## Prerequisites

1. **GitHub Account** with access to create packages
2. **NPM Account** (optional, for public npm registry)
3. **Node.js 18+** installed
4. **Git** configured with your credentials

## Publishing to GitHub Packages

### 1. Update Package Configuration

Before publishing, update the following in `package.json`:

```json
{
  "name": "@your-org/dynamic-form",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

Replace `@your-org` with your actual GitHub organization name.

### 2. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with these scopes:
   - `write:packages`
   - `read:packages`
   - `delete:packages` (optional)

### 3. Configure NPM Authentication

```bash
# Login to GitHub Packages
npm login --scope=@your-org --registry=https://npm.pkg.github.com

# Or set auth token directly
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> ~/.npmrc
```

### 4. Build and Publish

```bash
# Build the package
npm run build

# Publish to GitHub Packages
npm publish
```

## Installing in Projects

### Project Setup

In each project that needs to use the dynamic form:

```bash
# Configure npm to use GitHub Packages for your org
echo "@your-org:registry=https://npm.pkg.github.com" >> .npmrc

# Install the package
npm install @your-org/dynamic-form
```

### Authentication in CI/CD

For automated deployments, set the `NPM_TOKEN` environment variable:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm ci
  env:
    NPM_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Version Management

### Semantic Versioning

Follow semantic versioning for releases:

- **Patch** (1.0.1): Bug fixes, minor improvements
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

### Release Process

```bash
# Update version
npm version patch  # or minor/major

# Push tags
git push origin main --tags

# Publish new version
npm publish
```

## Multi-Project Integration

### Project A: E-commerce Application

```bash
# In your e-commerce project
npm install @your-org/dynamic-form

# Create wrapper component
# components/ProductForm.jsx
import { FormDisplay } from '@your-org/dynamic-form';
import '@your-org/dynamic-form/dist/index.css';

export default function ProductForm({ productId }) {
  return (
    <FormDisplay
      formId="product-registration"
      entityId={productId}
      cssClasses={{
        formContainer: 'ecommerce-form-container',
        submitButton: 'ecommerce-submit-btn'
      }}
      themeConfig={{
        theme: 'ecommerce',
        colors: {
          'primary-color': '#1e40af',
          'accent-color': '#f97316'
        }
      }}
    />
  );
}
```

### Project B: Healthcare Application

```bash
# In your healthcare project
npm install @your-org/dynamic-form

# Create specialized form
# components/PatientForm.jsx
import { FormDisplay } from '@your-org/dynamic-form';

export default function PatientForm({ patientId }) {
  const healthcareValidation = {
    'medical-id': (answerData) => {
      const medicalIdRegex = /^[A-Z]{2}\d{8}$/;
      if (answerData.value && !medicalIdRegex.test(answerData.value)) {
        return 'Medical ID must be in format: XX12345678';
      }
      return null;
    }
  };

  return (
    <FormDisplay
      formId="patient-profile"
      entityId={patientId}
      customValidation={healthcareValidation}
      themeConfig={{
        theme: 'healthcare',
        colors: {
          'primary-color': '#059669',
          'accent-color': '#3b82f6'
        }
      }}
    />
  );
}
```

## Environment Configuration

### Development Environment

```javascript
// next.config.js
module.exports = {
  env: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: 'http://localhost:4000/graphql'
  }
};
```

### Production Environment

```javascript
// next.config.js
module.exports = {
  env: {
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: 'https://api.yourapp.com/graphql'
  }
};
```

## Monitoring and Updates

### Package Updates

Monitor for updates and security patches:

```bash
# Check for updates
npm outdated @your-org/dynamic-form

# Update to latest version
npm update @your-org/dynamic-form
```

### Breaking Changes

When updating major versions, review:

1. **API Changes**: Check if component props have changed
2. **CSS Changes**: Verify custom styles still work
3. **Dependencies**: Ensure peer dependencies are compatible
4. **Migration Guide**: Follow any provided migration instructions

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   # Clear npm cache and re-authenticate
   npm cache clean --force
   npm login --scope=@your-org --registry=https://npm.pkg.github.com
   ```

2. **Version Conflicts**
   ```bash
   # Check installed version
   npm list @your-org/dynamic-form
   
   # Force reinstall
   npm uninstall @your-org/dynamic-form
   npm install @your-org/dynamic-form@latest
   ```

3. **Build Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Support

For issues and questions:

1. Check the main README.md for documentation
2. Review examples in the `/examples` directory
3. Create an issue in the GitHub repository
4. Contact the development team

## Security Considerations

### Package Security

- Regularly update dependencies
- Use `npm audit` to check for vulnerabilities
- Implement proper authentication for private packages
- Use environment variables for sensitive configuration

### Data Security

- Validate all form inputs on both client and server
- Implement proper CSRF protection
- Use HTTPS for all API communications
- Follow GDPR/privacy regulations for form data

## Performance Optimization

### Bundle Size

Monitor and optimize bundle size:

```bash
# Analyze bundle size
npm run build -- --analyze

# Use tree shaking for smaller bundles
import { FormDisplay } from '@your-org/dynamic-form';
// Instead of: import * from '@your-org/dynamic-form';
```

### Caching

Implement proper caching strategies:

- Cache form schemas
- Use React.memo for expensive components
- Implement proper loading states
- Optimize re-renders with useCallback/useMemo

This deployment guide ensures smooth integration across multiple projects while maintaining security and performance standards.
