const OpenAI = require('openai');
require('dotenv').config();

// Z.ai API client (OpenAI-compatible SDK)
const zai = new OpenAI({
  apiKey: process.env.ZAI_API_KEY,
  baseURL: 'https://api.z.ai/v1'
});

const SYSTEM_PROMPT = `You are an internal AI assistant for a project pricing system. Your job is to:
1. Extract all modules/features from project requirements
2. Classify each module as simple, medium, or complex based on:
   - simple: Basic functionality, standard implementation, minimal customization
   - medium: Moderate complexity, some customization, integrations needed
   - complex: Advanced features, heavy customization, multiple integrations
3. Match modules to common software components

Always respond with valid JSON only, no markdown, no explanations. Use this exact structure:
{
  "status": "ok" or "insufficient_info",
  "modules": [
    {"name": "Module Name", "level": "simple|medium|complex", "description": "brief description"}
  ],
  "summary": "Brief project summary",
  "required_details": ["list of missing info if status is insufficient_info"],
  "keywords": ["relevant", "project", "keywords"]
}

Common module categories to consider:
- User Authentication (login, register, OAuth, 2FA)
- Dashboard (stats, charts, widgets)
- CRUD Operations (data management)
- API Integration (third-party services)
- Payment Gateway (transactions, subscriptions)
- File Upload (documents, images, media)
- Notifications (email, SMS, push)
- Search (filtering, sorting)
- Reports (analytics, exports)
- Chat/Messaging (real-time communication)
- E-commerce Cart (shopping features)
- Admin Panel (management interface)
- Database Design (schema, optimization)`;

async function analyzeProject(requirementText) {
  try {
    const response = await zai.chat.completions.create({
      model: 'zeus-70b-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this project requirement and extract modules:\n\n${requirementText}` }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Z.ai Error:', error);
    throw new Error('Failed to analyze project requirements');
  }
}

async function checkSimilarity(keywords, existingProjects) {
  if (!existingProjects || existingProjects.length === 0) {
    return { similar: false, matchedProject: null };
  }

  try {
    const response = await zai.chat.completions.create({
      model: 'zeus-70b-preview',
      messages: [
        {
          role: 'system',
          content: 'Compare project keywords and determine similarity. Respond with JSON only: {"similar": true/false, "matchedProjectId": id or null, "similarity_score": 0-100}'
        },
        {
          role: 'user',
          content: `New project keywords: ${keywords.join(', ')}\n\nExisting projects:\n${JSON.stringify(existingProjects)}`
        }
      ],
      temperature: 0.2
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Similarity check error:', error);
    return { similar: false, matchedProject: null };
  }
}

module.exports = { analyzeProject, checkSimilarity };
