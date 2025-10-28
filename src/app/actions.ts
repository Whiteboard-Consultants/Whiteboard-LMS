
'use server';

import { suggestCourseContent, type SuggestCourseContentInput, type SuggestCourseContentOutput } from "@/ai/flows/suggest-course-content";
import { supabase } from '@/lib/supabase';

export async function getCourseSuggestions(input: SuggestCourseContentInput) {
  try {
    // Check if AI API key is available
    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    
    if (!hasApiKey) {
      // Provide intelligent static suggestions based on course description
      return { success: true, data: generateStaticSuggestions(input.courseDescription) };
    }
    
    const result = await suggestCourseContent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("AI suggestion failed:", error);
    // Fallback to static suggestions if AI fails
    return { success: true, data: generateStaticSuggestions(input.courseDescription) };
  }
}

function generateStaticSuggestions(courseDescription: string): SuggestCourseContentOutput {
  const description = courseDescription.toLowerCase();
  
  // Detect course type based on keywords
  const isWebDev = description.includes('web') || description.includes('html') || description.includes('css') || description.includes('javascript');
  const isProgramming = description.includes('programming') || description.includes('coding') || description.includes('python') || description.includes('java');
  const isBusiness = description.includes('business') || description.includes('marketing') || description.includes('management');
  const isDesign = description.includes('design') || description.includes('ui') || description.includes('ux') || description.includes('graphics');
  const isLanguage = description.includes('language') || description.includes('english') || description.includes('ielts') || description.includes('toefl');
  
  if (isWebDev) {
    return {
      courseStructureSuggestions: `Module 1: HTML Fundamentals
- Basic HTML structure and tags
- Semantic HTML elements
- Forms and input types
- HTML5 features

Module 2: CSS Styling
- CSS syntax and selectors
- Box model and layout
- Flexbox and Grid
- Responsive design principles

Module 3: JavaScript Basics
- Variables and data types
- Functions and scope
- DOM manipulation
- Event handling

Module 4: Advanced Topics
- Modern JavaScript (ES6+)
- API integration
- Version control with Git
- Deployment strategies

Module 5: Project Development
- Planning and wireframing
- Building a complete website
- Testing and debugging
- Portfolio showcase`,

      exerciseTypeSuggestions: `1. Coding Challenges
- Build HTML structure for different webpage types
- Style components with CSS
- Create interactive elements with JavaScript

2. Hands-on Projects
- Personal portfolio website
- Responsive landing page
- Interactive web application
- E-commerce product page

3. Problem-Solving Tasks
- Debug broken code snippets
- Optimize website performance
- Fix responsive design issues
- Implement accessibility features

4. Peer Review Activities
- Code review sessions
- Design critique workshops
- Collaborative coding projects
- Best practices discussions`,

      assignmentSuggestions: `1. Progressive Web Projects
- Week 1-2: Create a personal bio page using HTML/CSS
- Week 3-4: Build a responsive portfolio with multiple pages
- Week 5-6: Add JavaScript interactivity and animations
- Week 7-8: Integrate external APIs and deploy online

2. Real-World Scenarios
- Client brief simulation projects
- Redesign existing websites
- Mobile-first responsive challenges
- Cross-browser compatibility testing

3. Portfolio Development
- Document learning journey through blog posts
- Create case studies for each project
- Build a professional developer portfolio
- Present final projects to the class

4. Community Engagement
- Contribute to open-source projects
- Participate in coding challenges
- Join developer communities and forums
- Mentor newer students in the program`
    };
  }

  if (isProgramming) {
    return {
      courseStructureSuggestions: `Module 1: Programming Fundamentals
- Variables, data types, and operators
- Control structures (loops, conditionals)
- Functions and procedures
- Basic input/output operations

Module 2: Data Structures
- Arrays and lists
- Dictionaries and sets
- Stacks and queues
- Trees and graphs basics

Module 3: Object-Oriented Programming
- Classes and objects
- Inheritance and polymorphism
- Encapsulation and abstraction
- Design patterns introduction

Module 4: Problem Solving
- Algorithm design strategies
- Debugging and testing
- Code optimization
- Error handling

Module 5: Practical Applications
- File handling and databases
- API integration
- Version control systems
- Project development lifecycle`,

      exerciseTypeSuggestions: `1. Algorithm Implementation
- Sorting and searching algorithms
- Mathematical problem solving
- Data manipulation exercises
- Logic puzzle solutions

2. Code Review and Debugging
- Fix buggy code segments
- Code refactoring challenges
- Performance optimization tasks
- Best practices implementation

3. Project-Based Learning
- Small utility programs
- Game development projects
- Data analysis tools
- Web scraping applications

4. Collaborative Coding
- Pair programming sessions
- Group project development
- Code review workshops
- Open-source contributions`,

      assignmentSuggestions: `1. Progressive Skill Building
- Basic calculator application
- Text processing utilities
- Simple database management system
- Mini web application with backend

2. Real-World Problem Solving
- Automate daily tasks with scripts
- Build tools for data analysis
- Create educational games or quizzes
- Develop mobile or desktop applications

3. Portfolio Projects
- Document code with clear explanations
- Create GitHub repositories for each project
- Write technical blog posts about solutions
- Present projects with live demonstrations

4. Advanced Challenges
- Contribute to existing open-source projects
- Participate in coding competitions
- Build applications using multiple technologies
- Mentor junior developers or students`
    };
  }

  if (isLanguage) {
    return {
      courseStructureSuggestions: `Module 1: Foundation Skills
- Grammar fundamentals and sentence structure
- Basic vocabulary building
- Pronunciation and phonetics
- Listening comprehension basics

Module 2: Reading and Writing
- Reading strategies and comprehension
- Essay structure and organization
- Academic writing conventions
- Critical thinking through text analysis

Module 3: Speaking and Listening
- Conversation skills and fluency
- Presentation techniques
- Active listening strategies
- Accent reduction and clarity

Module 4: Test Preparation (IELTS/TOEFL)
- Test format familiarization
- Time management strategies
- Practice tests and mock exams
- Score improvement techniques

Module 5: Advanced Applications
- Academic English for higher education
- Professional communication skills
- Cultural context and idiomatic expressions
- Real-world language use scenarios`,

      exerciseTypeSuggestions: `1. Interactive Speaking Practice
- Role-playing scenarios
- Debate and discussion activities
- Presentation workshops
- Conversation partner exercises

2. Writing Development
- Structured essay assignments
- Creative writing projects
- Grammar correction exercises
- Peer editing sessions

3. Listening and Comprehension
- Audio and video analysis
- Note-taking practice
- Dictation exercises
- Accent recognition training

4. Test Simulation
- Timed practice tests
- Section-specific skill building
- Strategy implementation exercises
- Score tracking and improvement`,

      assignmentSuggestions: `1. Skill-Building Assignments
- Daily vocabulary journals
- Weekly essay compositions
- Recorded speaking practice sessions
- Listening log with reflection notes

2. Real-World Applications
- Conduct interviews with native speakers
- Write letters or emails for practical purposes
- Create presentations on personal interests
- Participate in English-language community events

3. Test Preparation Portfolio
- Complete practice test series
- Error analysis and improvement plans
- Strategy documentation and refinement
- Mock test performance tracking

4. Creative Projects
- Storytelling and narrative writing
- Podcast or video creation projects
- Cultural exchange presentations
- Language learning blog or journal`
    };
  }

  // Generic suggestions for other types of courses
  return {
    courseStructureSuggestions: `Module 1: Introduction and Foundations
- Course overview and learning objectives
- Basic concepts and terminology
- Historical context and background
- Essential tools and resources

Module 2: Core Concepts
- Fundamental principles and theories
- Key methodologies and approaches
- Best practices and standards
- Common challenges and solutions

Module 3: Practical Applications
- Hands-on exercises and workshops
- Real-world case studies
- Problem-solving scenarios
- Industry-relevant examples

Module 4: Advanced Topics
- Specialized techniques and strategies
- Current trends and innovations
- Future developments and opportunities
- Professional development paths

Module 5: Integration and Mastery
- Capstone projects and assessments
- Peer collaboration and feedback
- Portfolio development
- Career preparation and networking`,

    exerciseTypeSuggestions: `1. Knowledge Application
- Case study analysis and discussion
- Problem-solving workshops
- Scenario-based simulations
- Critical thinking exercises

2. Skill Development
- Hands-on practice sessions
- Peer learning and collaboration
- Mentoring and tutoring opportunities
- Real-world project work

3. Assessment and Feedback
- Formative quizzes and checkpoints
- Peer review and evaluation
- Self-reflection and goal setting
- Progress tracking and improvement

4. Creative Expression
- Project presentations and showcases
- Innovation challenges
- Creative problem-solving tasks
- Interdisciplinary connections`,

    assignmentSuggestions: `1. Progressive Learning
- Weekly reflection journals
- Skill-building exercises
- Incremental project development
- Knowledge synthesis assignments

2. Real-World Application
- Industry case study analysis
- Professional skill demonstrations
- Community engagement projects
- Workplace simulation exercises

3. Collaborative Work
- Group research projects
- Peer teaching and presentations
- Cross-functional team assignments
- Community of practice participation

4. Portfolio Development
- Documentation of learning journey
- Evidence of skill acquisition
- Professional presentation materials
- Career readiness demonstration`
  };
}

export async function sendNotification(data: { senderId: string; senderName: string, receiverId: string; message: string; }) {
  if (!data.senderId || !data.receiverId || !data.message) {
    return { success: false, error: 'Missing required fields.' };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        sender_id: data.senderId,
        sender_name: data.senderName,
        receiver_id: data.receiverId,
        message: data.message,
        is_read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Supabase notification error:", error);
      return { success: false, error: 'Failed to send notification.' };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: 'Failed to send notification.' };
  }
}
