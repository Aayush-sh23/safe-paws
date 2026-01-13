# Contributing to Safe Paws

Thank you for your interest in contributing to Safe Paws! This project aims to improve both human safety and animal welfare through data-driven decision making.

## 🎯 Project Mission

Safe Paws is not an anti-dog platform. It's a humanitarian tool that:
- Converts scattered complaints into actionable data
- Enables targeted, humane interventions
- Balances human safety with animal welfare
- Prevents emotional or isolated reactions

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Aayush-sh23/safe-paws/issues)
2. If not, create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing [Issues](https://github.com/Aayush-sh23/safe-paws/issues) for similar suggestions
2. Create a new issue with:
   - Clear description of the feature
   - Use case / problem it solves
   - Proposed implementation (if you have ideas)
   - Impact on municipalities/NGOs

### Code Contributions

#### Setup Development Environment

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/safe-paws.git
cd safe-paws

# Install dependencies
npm install

# Create .env file (see SETUP_GUIDE.md)
cp .env.example .env

# Start development server
npm start
```

#### Making Changes

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following our coding standards

3. Test your changes thoroughly

4. Commit with clear messages:
```bash
git commit -m "Add: Brief description of what you added"
git commit -m "Fix: Brief description of what you fixed"
git commit -m "Update: Brief description of what you updated"
```

5. Push to your fork:
```bash
git push origin feature/your-feature-name
```

6. Create a Pull Request

## 📝 Coding Standards

### JavaScript Style

- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use arrow functions where appropriate
- Add comments for complex logic
- Keep functions small and focused

### File Organization

```
safe-paws/
├── config/          # Configuration files
├── routes/          # API route handlers
├── utils/           # Utility functions
├── public/          # Frontend files
│   ├── css/        # Stylesheets
│   └── js/         # Client-side JavaScript
└── database/        # Database schemas
```

### Naming Conventions

- **Files**: lowercase with hyphens (`incident-routes.js`)
- **Functions**: camelCase (`calculateHotspots`)
- **Constants**: UPPER_SNAKE_CASE (`HOTSPOT_RADIUS`)
- **Classes**: PascalCase (`IncidentManager`)

### API Design

- RESTful endpoints
- Use proper HTTP methods (GET, POST, PATCH, DELETE)
- Return consistent JSON responses:
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Database

- Use parameterized queries (Supabase handles this)
- Add indexes for frequently queried fields
- Document schema changes in `database/schema.sql`

## 🧪 Testing

Currently, Safe Paws uses manual testing. We welcome contributions to add:
- Unit tests (Jest)
- Integration tests
- E2E tests (Playwright)

## 📚 Documentation

When adding features, please update:
- `README.md` - If it affects setup or usage
- `SETUP_GUIDE.md` - If it changes configuration
- `ARCHITECTURE.md` - If it changes system design
- Code comments - For complex logic

## 🌍 Internationalization

We plan to support multiple languages. If you can help:
- Translate UI text
- Add language files
- Implement i18n framework

## 🔒 Security

If you discover a security vulnerability:
1. **DO NOT** create a public issue
2. Email the repository owner directly
3. Provide details and steps to reproduce
4. Allow time for a fix before public disclosure

## 🎨 Design Contributions

We welcome:
- UI/UX improvements
- Mobile app designs
- Dashboard enhancements
- Accessibility improvements

## 📱 Mobile App Development

Interested in building mobile apps?
- React Native for iOS/Android
- Follow existing API structure
- Maintain feature parity with web app

## 🌟 Priority Areas

We especially need help with:
- [ ] Mobile applications
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Machine learning for risk prediction
- [ ] Integration with municipal systems
- [ ] Automated testing
- [ ] Performance optimization
- [ ] Documentation improvements

## 💬 Communication

- **GitHub Issues**: For bugs and features
- **Pull Requests**: For code contributions
- **Discussions**: For general questions

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Age, body size, disability
- Ethnicity, gender identity
- Experience level
- Nationality, personal appearance
- Race, religion, sexual orientation

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior:**
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to the repository owner.

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Acknowledged in documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution, no matter how small, helps make communities safer and improves animal welfare. Thank you for being part of this mission!

---

**Questions?** Open an issue or reach out to the maintainers.

**Ready to contribute?** Check out [good first issues](https://github.com/Aayush-sh23/safe-paws/labels/good%20first%20issue)!