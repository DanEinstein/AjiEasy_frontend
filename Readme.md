# AjiEasy - AI-Powered Interview Preparation Platform

Master your next interview with cutting-edge AI technology. AjiEasy transforms interview preparation by generating personalized questions, providing practice environments, and helping you land your dream job with confidence.

![AjiEasy Banner](https://img.shields.io/badge/AI-Powered-blue) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🎯 Overview

AjiEasy is an AI-driven interview preparation platform that helps candidates across all industries prepare effectively for their interviews. Powered by Google's Gemini AI and Groq AI, it delivers personalized interview questions and actionable feedback.

## 🌟 Features

- **🤖 AI-Powered Question Generation**: Leverages Google Gemini AI and Groq AI for intelligent question creation
- **🎯 Personalized Practice**: Tailored questions based on your target role, company, and interview type
- **📊 Performance Analytics**: Track your improvement with detailed analytics and insights
- **🏢 Industry Coverage**: Support for technical roles, leadership positions, and all career levels
- **💡 Real-time Feedback**: Get personalized feedback on your responses
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Basic text editor or IDE (VS Code, Sublime Text, etc.)
- Local web server (optional, but recommended for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DanEinstein/AjiEasy_frontend.git
   cd ajieasy-frontend
   ```

2. **Project Structure**
   ```
   ajieasy-frontend/
   ├── index.html          # Main landing page
   ├── images/             # Image assets
   └── README.md
   ```

3. **Running Locally**

   **Option A: Using Python's built-in server**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option B: Using Node.js http-server**
   ```bash
   npx http-server -p 8000
   ```

   **Option C: Using VS Code Live Server**
   - Install the "Live Server" extension
   - Right-click on `index.html`
   - Select "Open with Live Server"

4. **Access the application**
   ```
   Open your browser and navigate to:
   http://localhost:8000
   ```

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure and semantic markup |
| CSS3 | Styling and animations |
| JavaScript (ES6+) | Application logic and interactivity |
| Google Gemini AI | AI-powered question generation |
| Groq AI | Advanced AI processing |
| Fetch API | Backend communication |

## 📁 File Structure Details

### HTML Files
- `index.html` - Main landing page with all features and functionality

### Images
- `images/` - Image assets and visual content

## 🎨 Customization

### Changing Colors
Edit the CSS in your `index.html` file within the `<style>` tags or inline styles:
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  --accent-color: #your-color;
}
```

### Updating Content
All content, styles, and scripts are contained in `index.html`. Simply edit the file to make changes.

## 🔧 Configuration

If you need to add API configurations, you can include them in a `<script>` tag in your `index.html`:
```javascript
const CONFIG = {
  API_BASE_URL: 'https://api.ajieasy.com',
  GEMINI_API_KEY: 'your-gemini-api-key',
  GROQ_API_KEY: 'your-groq-api-key',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: 'production' // or 'development'
};
```

**⚠️ Security Note**: Never commit API keys directly in your HTML file. Use environment variables or a backend proxy for sensitive keys.

## 📱 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 versions |
| Firefox | Latest 2 versions |
| Safari | Latest 2 versions |
| Edge | Latest 2 versions |

## 🚢 Deployment

### Vercel (Current Hosting)
The project is currently deployed on Vercel at:
```
https://aji-easy-frontend.vercel.app/
```

To deploy updates:
1. Push changes to your GitHub repository
2. Vercel will automatically deploy the changes

### Manual Deployment to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Alternative Hosting Options
- **Netlify**: Drag and drop the folder or connect GitHub repo
- **GitHub Pages**: Push to `gh-pages` branch
- **Firebase Hosting**: Use Firebase CLI
- **AWS S3**: Upload files and configure static website hosting

## 🧪 Testing

### Manual Testing Checklist
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Responsive design works on mobile/tablet
- [ ] API calls complete without errors
- [ ] Authentication flow works properly
- [ ] Analytics display correctly

### Browser Testing
Test across different browsers to ensure compatibility.

## 📊 Performance Optimization

- **Image Optimization**: Compress images using tools like TinyPNG
- **Minification**: Minify CSS and JavaScript for production
- **Caching**: Implement browser caching strategies
- **CDN**: Use CDN for static assets
- **Lazy Loading**: Implement lazy loading for images and content

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines
- Use 2 spaces for indentation
- Follow semantic HTML practices
- Use meaningful variable and function names
- Comment complex logic
- Keep functions small and focused

## 🐛 Known Issues

- [ ] List any known bugs or limitations
- [ ] Track issues on GitHub Issues page

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial release
- AI-powered question generation
- User authentication
- Performance analytics
- Responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Creator**: [Your Name]
- **Project**: AjiEasy - AI Interview Preparation Platform
- **Contact**: [your.email@example.com]

## 🙏 Acknowledgments

- Google Gemini AI for powering intelligent question generation
- Groq AI for advanced AI processing
- All contributors and testers who helped improve AjiEasy

## 📞 Support

- **Website**: https://aji-easy-frontend.vercel.app/
- **Email**: support@ajieasy.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/ajieasy-frontend/issues)

## 🗺️ Roadmap

- [ ] Video interview simulation
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Company-specific interview guides
- [ ] Peer practice matching
- [ ] Interview scheduling integration

---

**Made with ❤️ to help you land your dream job**