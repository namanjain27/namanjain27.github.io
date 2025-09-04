# features to work upon:

1. Visual Appeal
- Replace plain gray/white sections with subtle gradients and textures 
- Enhance the purple neon theme throughout the site for consistency                             
- Add subtle animations and parallax effects
- Enhance dark mode with better purple/dark theme consistency  

2. Projects Section Complete Redesign            
- Convert horizontal cards to responsive grid layout (2-3 columns on desktop, 1 on mobile)     
- Add more projects to fill the grid (at least 4-6 projects)                                    
- Create vertical project cards with:            
- Larger project thumbnails with hover zoom effects                                          
- Tech stack icons     

3. Header & Contact Integration                                                      
- Add social media icons (GitHub, LinkedIn, Twitter, StackOverflow, Itch.io) as floating widget on the side in hero section
- Enhance existing contact form with better styling and animations     

4. UX
- Add timeline animations to experience section

---

# Development Plan

## Phase 1: Visual Appeal & Theme Enhancement

### 1.1 Background & Section Styling
- Update CSS to replace plain backgrounds with gradients
- Create consistent purple neon theme variables
- Add texture patterns for visual interest
- Implement better section dividers

### 1.2 Dark Mode Improvements
- Enhance existing dark mode CSS with purple accent colors
- Improve contrast ratios for better readability
- Add smooth theme transition animations
- Ensure all new elements support dark mode

### 1.3 Animations & Micro-interactions
- Add CSS keyframe animations for scroll-triggered elements
- Implement hover effects for interactive elements
- Add parallax scrolling effects to hero section
- Create loading animations for page elements

## Phase 2: Projects Section Redesign

### 2.1 HTML Structure Update
- Modify projects section HTML to support grid layout
- Add placeholder project cards to reach 4-6 total projects (which works like when there are <=4 projects then just 1 row of cards then new cards come on next row)

### 2.2 CSS Grid Implementation
- Create responsive CSS Grid layout
- Design vertical project card components
- Implement hover zoom effects for project thumbnails
- Add tech stack icon styling

### 2.3 Project Content Enhancement
- Include tech stack icons/badges for each project (icons from website like https://icons8.com/icons/ might help; directly use via link)

## Phase 3: Contact & Social Integration

### 3.1 Floating Social Widget
- Create floating social media widget for hero section
- Add social media icons (GitHub, LinkedIn, Twitter, StackOverflow, Itch.io)
- Implement smooth animations and hover effects
- Ensure mobile responsiveness

### 3.2 Contact Form Enhancement
- Improve contact form styling with purple theme
- Enhance form submit experience

## Phase 4: UX Enhancements

### 4.1 Timeline Animations
- Add scroll-triggered animations to experience timeline
- Implement staggered animation effects
- Create smooth reveal animations for timeline items
- Add hover interactions for timeline elements

## Phase 5: Testing & Optimization
**Priority: Medium | Estimated Time: 1 hour**

### 5.1 Cross-browser Testing
- Test all new features across different browsers
- Verify mobile responsiveness
- Check accessibility compliance
- Optimize performance

### 5.2 Final Polishing
- Fine-tune animations and transitions
- Adjust spacing and typography
- Validate HTML/CSS
- Test dark/light mode switching

## Technical Implementation Notes

### File Structure:
- Main modifications: `index.html`, `css/styles.css`
- Potential new files: Additional project images, icon assets
- JavaScript enhancements in existing `js/scripts.js`

### Key CSS Techniques:
- CSS Grid and Flexbox for layouts
- CSS Custom Properties for theme consistency
- Transform and transition properties for animations
- Media queries for responsive design

### Dependencies:
- Font Awesome icons (already included)
- Existing jQuery setup (for enhanced interactions)
- No additional external libraries required